using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Newtonsoft.Json;

class Program
{
    private static HttpListener httpListener = new HttpListener();
    private static List<WebSocket> webSockets = new List<WebSocket>();

    static void Main(string[] args)
    {
        string directoryPath = args.Length > 0 ? args[0] : "path/to/cloned_repos";

        if (!Directory.Exists(directoryPath))
        {
            Console.WriteLine($"Directory not found: {directoryPath}");
            return;
        }

        // Step 1: Start the WebSocket server
        StartWebSocketServer();

        // Step 2: Process the project files and generate the JSON file
        string projectName = new DirectoryInfo(directoryPath).Name;
        string outputPath = $"/home/ec2-user/Code-Analyzer/C#/ProjectParse.txt";
        string jsonOutputPath = "/home/ec2-user/Code-Analyzer/NodeJs/GraphData.json";

        var classInfos = new List<ClassInfo>();

        using (StreamWriter streamWriter = new StreamWriter(outputPath))
        {
            streamWriter.WriteLine($"Project: {projectName}");
            streamWriter.WriteLine(); // Add a line space below the project name

            var files = Directory.GetFiles(directoryPath, "*.cs", SearchOption.AllDirectories);
            foreach (var file in files)
            {
                AnalyzeFile(file, classInfos);
            }

            // Write output file
            WriteOutputFile(streamWriter, classInfos);

            // Write JSON file
            WriteJsonFile(jsonOutputPath, classInfos);
            Console.WriteLine("JSON file created.");
        }

        Environment.Exit(0);
        // Step 3: Notify WebSocket clients that the JSON file creation is complete
        NotifyClients(true);

        // Step 4: Stop the WebSocket server after notification
        StopWebSocketServer();

    }

    static void StartWebSocketServer()
    {
        httpListener.Prefixes.Add("http://localhost:5001/"); // WebSocket server running on port 5001
        httpListener.Start();
        Console.WriteLine("WebSocket server started on ws://localhost:5001/");

        var context = httpListener.GetContext(); // Blocking call until a request comes in

        if (context.Request.IsWebSocketRequest)
        {
            var wsContext = context.AcceptWebSocketAsync(null).Result; // Accept WebSocket request
            var webSocket = wsContext.WebSocket;
            webSockets.Add(webSocket);

            byte[] buffer = new byte[1024];
            while (webSocket.State == WebSocketState.Open)
            {
                var result = webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), System.Threading.CancellationToken.None).Result;
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", System.Threading.CancellationToken.None).Wait();
                    webSockets.Remove(webSocket);
                }
            }
        }
        else
        {
            context.Response.StatusCode = 400;
            context.Response.Close();
        }
    }

    static void NotifyClients(bool isGraphJsonReady)
    {
        var messageObject = new
        {
            GraphJason = isGraphJsonReady
        };

        string message = JsonConvert.SerializeObject(messageObject);

        byte[] messageBuffer = Encoding.UTF8.GetBytes(message);
        foreach (var webSocket in webSockets)
        {
            if (webSocket.State == WebSocketState.Open)
            {
                webSocket.SendAsync(new ArraySegment<byte>(messageBuffer), WebSocketMessageType.Text, true, System.Threading.CancellationToken.None).Wait();
            }
        }
    }

    static void StopWebSocketServer()
    {
        httpListener.Stop();
        Console.WriteLine("WebSocket server stopped.");
    }

    
    static void AnalyzeFile(string filePath, List<ClassInfo> classInfos)
    {
        string code = File.ReadAllText(filePath);

        SyntaxTree tree = CSharpSyntaxTree.ParseText(code);
        var compilation = CSharpCompilation.Create("CodeAnalysis")
            .AddReferences(MetadataReference.CreateFromFile(typeof(object).Assembly.Location))
            .AddReferences(MetadataReference.CreateFromFile(typeof(Console).Assembly.Location))
            .AddSyntaxTrees(tree);

        var semanticModel = compilation.GetSemanticModel(tree);
        var root = tree.GetRoot();

        var classes = root.DescendantNodes().OfType<ClassDeclarationSyntax>();

        foreach (var classNode in classes)
        {
            var className = Path.GetFileNameWithoutExtension(filePath);
            var classInfo = new ClassInfo
            {
                FolderName = Path.GetFileName(Path.GetDirectoryName(filePath)),
                FileName = Path.GetFileName(filePath),
                ClassName = className,
                ProjectType = GetProjectType(filePath)
            };
            AnalyzeClass(classNode, semanticModel, classInfo);
            classInfos.Add(classInfo);
        }
    }

    static void AnalyzeClass(ClassDeclarationSyntax classNode, SemanticModel semanticModel, ClassInfo classInfo, string nestedPrefix = "")
    {
        var classSymbol = semanticModel.GetDeclaredSymbol(classNode) as INamedTypeSymbol;
        string className = nestedPrefix + classSymbol.Name;

        classInfo.Accessibility = GetAccessModifier(classSymbol);

        // Inheritance
        var baseType = classSymbol.BaseType;
        if (baseType != null && baseType.Name != "Object")
        {
            classInfo.InheritsFrom = baseType.Name;
        }

        foreach (var member in classSymbol.GetMembers().OfType<IMethodSymbol>())
    {
        if (member.MethodKind == MethodKind.Ordinary) // Only ordinary methods, not constructors or properties
        {
            classInfo.Methods.Add(new MethodInfo
            {
                Name = member.Name,
                Accessibility = GetAccessModifier(member)
            });
        }
    }

        // Composition and Aggregation (fields and properties)
        var compositionCandidates = new HashSet<string>();
        var aggregationCandidates = new HashSet<string>();

        foreach (var member in classSymbol.GetMembers().OfType<IFieldSymbol>())
        {
            if (member.Type != null && !IsPrimitiveType(member.Type.Name))
            {
                var typeName = GetElementTypeName(member.Type);
                if (IsCompositionField(member))
                {
                    compositionCandidates.Add(typeName);
                    Console.WriteLine($"Field {member.Name} ({typeName}) is classified as Composition.");
                }
                else
                {
                    aggregationCandidates.Add(typeName);
                    Console.WriteLine($"Field {member.Name} ({typeName}) is classified as Aggregation.");
                }
            }
        }

        foreach (var member in classSymbol.GetMembers().OfType<IPropertySymbol>())
        {
            if (member.Type != null && !IsPrimitiveType(member.Type.Name))
            {
                var typeName = GetElementTypeName(member.Type);
                if (IsCompositionProperty(member))
                {
                    compositionCandidates.Add(typeName);
                    Console.WriteLine($"Property {member.Name} ({typeName}) is classified as Composition.");
                }
                else if (IsAggregationProperty(member, semanticModel))
                {
                    aggregationCandidates.Add(typeName);
                    Console.WriteLine($"Property {member.Name} ({typeName}) is classified as Aggregation.");
                }
            }
        }

        // Finalize classification: if a type is in both composition and aggregation candidates, it is classified as aggregation.
        foreach (var type in compositionCandidates)
        {
            if (aggregationCandidates.Contains(type))
            {
                classInfo.Aggregations.Add(type);
            }
            else
            {
                classInfo.Composition.Add(type);
            }
        }

        foreach (var type in aggregationCandidates)
        {
            classInfo.Aggregations.Add(type);
        }

        // Nested Classes
        var nestedClasses = classNode.Members.OfType<ClassDeclarationSyntax>();
        foreach (var nestedClass in nestedClasses)
        {
            var nestedClassInfo = new ClassInfo
            {
                FolderName = classInfo.FolderName,
                FileName = classInfo.FileName,
                ClassName = className + "." + nestedClass.Identifier.Text,
                ProjectType = classInfo.ProjectType
            };
            AnalyzeClass(nestedClass, semanticModel, nestedClassInfo, nestedPrefix + classSymbol.Name + ".");
            classInfo.NestedClasses.Add(nestedClassInfo);
        }

        // Clean up associations
        classInfo.Associations.RemoveWhere(a => IsPrimitiveType(a) || IsMethodParameterOrReturnType(a));
    }

    static bool IsCompositionField(IFieldSymbol fieldSymbol)
    {
        return fieldSymbol.DeclaredAccessibility == Accessibility.Private || fieldSymbol.DeclaredAccessibility == Accessibility.Protected || fieldSymbol.IsReadOnly;
    }

    static bool IsCompositionProperty(IPropertySymbol propertySymbol)
    {
        return propertySymbol.SetMethod == null;
    }

    static bool IsAggregationProperty(IPropertySymbol propertySymbol, SemanticModel semanticModel)
    {
        if (propertySymbol.SetMethod == null || propertySymbol.SetMethod.DeclaredAccessibility != Accessibility.Public)
        {
            return false;
        }

        // Check if the setter contains a 'new' keyword
        var setterMethod = propertySymbol.SetMethod.DeclaringSyntaxReferences.FirstOrDefault()?.GetSyntax() as AccessorDeclarationSyntax;
        if (setterMethod != null)
        {
            var containsNew = setterMethod.DescendantNodes().OfType<ObjectCreationExpressionSyntax>().Any();
            return !containsNew;
        }

        return true;
    }

    static string GetElementTypeName(ITypeSymbol typeSymbol)
    {
        if (typeSymbol is INamedTypeSymbol namedTypeSymbol && namedTypeSymbol.IsGenericType)
        {
            var typeName = namedTypeSymbol.TypeArguments.FirstOrDefault()?.Name;
            return typeName ?? namedTypeSymbol.Name;
        }
        return typeSymbol.Name;
    }

    static void AddComponentTypes(HashSet<string> componentTypes, ITypeSymbol typeSymbol)
    {
        if (typeSymbol is INamedTypeSymbol namedTypeSymbol && namedTypeSymbol.IsGenericType)
        {
            foreach (var typeArg in namedTypeSymbol.TypeArguments)
            {
                if (!IsPrimitiveType(typeArg.Name))
                {
                    componentTypes.Add(typeArg.Name);
                }
            }
        }
        else if (typeSymbol is IArrayTypeSymbol arrayTypeSymbol)
        {
            AddComponentTypes(componentTypes, arrayTypeSymbol.ElementType);
        }
        else
        {
            var typeName = typeSymbol.Name;
            if (!componentTypes.Contains(typeName))
            {
                componentTypes.Add(typeName);
            }
        }
    }

    static string GetAccessModifier(ISymbol symbol)
    {
        return symbol.DeclaredAccessibility switch
        {
            Accessibility.Public => "public",
            Accessibility.Private => "private",
            Accessibility.Protected => "protected",
            Accessibility.Internal => "internal",
            Accessibility.ProtectedOrInternal => "protected internal",
            _ => "private", // Default to private if none of the above
        };
    }

    static bool IsPrimitiveType(string typeName)
    {
        var primitiveTypes = new HashSet<string>
        {
            "bool", "byte", "sbyte", "char", "decimal", "double", "float", "int",
            "uint", "long", "ulong", "short", "ushort", "string",
            "void", "boolean", "byte", "sbyte", "char", "decimal", "double",
            "single", "int32", "uint32", "int64", "uint64", "int16",
            "uint16", "string", "datetime"
        };
        return primitiveTypes.Contains(typeName.ToLower());
    }

    static string GetFullTypeName(ITypeSymbol typeSymbol)
    {
        if (typeSymbol is INamedTypeSymbol namedTypeSymbol && namedTypeSymbol.IsGenericType)
        {
            var genericType = namedTypeSymbol.ToString();
            var typeArgs = namedTypeSymbol.TypeArguments.Select(arg => arg.ToString()).ToList();
            return $"{genericType}<{string.Join(", ", typeArgs)}>";
        }
        return typeSymbol.ToString();
    }

    static bool IsMethodParameterOrReturnType(string typeName)
    {
        return typeName.Contains("<");
    }

    static string GetProjectType(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
        {
            return "Unknown";
        }

        var dir = Directory.GetParent(filePath);
        while (dir != null && !Directory.GetFiles(dir.FullName, "*.csproj").Any())
        {
            dir = dir.Parent;
        }

        if (dir != null)
        {
            var csprojPath = Directory.GetFiles(dir.FullName, "*.csproj").FirstOrDefault();
            if (csprojPath != null)
            {
                var lines = File.ReadAllLines(csprojPath);
                foreach (var line in lines)
                {
                    if (line.Contains("<OutputType>"))
                    {
                        if (line.Contains("Exe"))
                        {
                            return "EXE";
                        }
                        else if (line.Contains("Library"))
                        {
                            return "DLL";
                        }
                    }
                }
            }
        }
        return "Unknown";
    }

    static void WriteOutputFile(StreamWriter streamWriter, List<ClassInfo> classInfos)
    {
        foreach (var classInfo in classInfos)
        {
            streamWriter.WriteLine($"Folder: {classInfo.FolderName}");
            streamWriter.WriteLine($"File: {classInfo.FileName}");
            streamWriter.WriteLine($"Class: {classInfo.ClassName}");
            streamWriter.WriteLine($"  Accessibility: {classInfo.Accessibility}");
            streamWriter.WriteLine($"  Belongs to: {classInfo.ProjectType}");

            if (!string.IsNullOrEmpty(classInfo.InheritsFrom))
            {
                streamWriter.WriteLine($"  Inherits from: {classInfo.InheritsFrom}");
            }

            var nonPrimitiveComponents = classInfo.Composition.Where(c => !IsPrimitiveType(c)).ToList();
            if (nonPrimitiveComponents.Any())
            {
                streamWriter.WriteLine("  Composition:");
                foreach (var component in nonPrimitiveComponents)
                {
                    streamWriter.WriteLine($"    {component}");
                }
            }

            var nonPrimitiveAggregations = classInfo.Aggregations.Where(a => !IsPrimitiveType(a)).ToList();
            if (nonPrimitiveAggregations.Any())
            {
                streamWriter.WriteLine("  Aggregations:");
                foreach (var aggregation in nonPrimitiveAggregations)
                {
                    streamWriter.WriteLine($"    {aggregation}");
                }
            }

            var nonPrimitiveAssociations = classInfo.Associations
                .Where(a => !IsPrimitiveType(a.Split('<')[0])) // Check only the main type, ignore the generic arguments
                .ToList();
            if (nonPrimitiveAssociations.Any())
            {
                streamWriter.WriteLine("  Associations:");
                foreach (var association in nonPrimitiveAssociations)
                {
                    streamWriter.WriteLine($"    {association}");
                }
            }

            if (classInfo.NestedClasses.Any())
            {
                streamWriter.WriteLine("  Nested Classes:");
                foreach (var nestedClass in classInfo.NestedClasses)
                {
                    streamWriter.WriteLine($"    {nestedClass.ClassName}");
                }
            }

            streamWriter.WriteLine();
        }
    }

    static void WriteJsonFile(string jsonOutputPath, List<ClassInfo> classInfos)
{
    foreach (var classInfo in classInfos)
    {
        classInfo.Composition = new HashSet<string>(classInfo.Composition.Where(c => !IsPrimitiveType(c)));
        classInfo.Aggregations = new HashSet<string>(classInfo.Aggregations.Where(a => !IsPrimitiveType(a)));
        classInfo.Associations = new HashSet<string>(classInfo.Associations
            .Where(a => !IsPrimitiveType(a.Split('<')[0]))); // Check only the main type, ignore the generic arguments
    }

    var classInfosForJson = classInfos.Select(classInfo => new
    {
        classInfo.FolderName,
        classInfo.ClassName,
        classInfo.Accessibility,
        classInfo.InheritsFrom,
        Compositions = classInfo.Composition.ToList(),
        Aggregations = classInfo.Aggregations.ToList(),
        Associations = classInfo.Associations.ToList(),
        NestedClasses = classInfo.NestedClasses,
        Methods = classInfo.Methods.Select(m => $"{GetVisibilitySign(m.Accessibility)} {m.Name}").ToList()
    }).ToList();

    var json = JsonConvert.SerializeObject(classInfosForJson, Formatting.Indented);
    File.WriteAllText(jsonOutputPath, json);
    NotifyClients(true);
}

static string GetVisibilitySign(string accessibility)
{
    return accessibility switch
    {
        "public" => "+",
        "protected" => "#",
        "private" => "-",
        "internal" => "~",
        _ => "*"
    };
}

}

class ClassInfo
{
    public string FolderName { get; set; }
    public string FileName { get; set; } // Include FileName for the output file
    public string ClassName { get; set; }
    public string Accessibility { get; set; }
    [JsonIgnore]
    public string ProjectType { get; set; } // Exclude ProjectType from JSON
    public string InheritsFrom { get; set; }
    public HashSet<string> Composition { get; set; } = new HashSet<string>();
    public List<ClassInfo> NestedClasses { get; set; } = new List<ClassInfo>();
    public HashSet<string> Aggregations { get; set; } = new HashSet<string>();
    public HashSet<string> Associations { get; set; } = new HashSet<string>();
    public List<MethodInfo> Methods { get; set; } = new List<MethodInfo>(); // Add this line
}

class MethodInfo
{
    public string Name { get; set; }
    public string Accessibility { get; set; }
}
