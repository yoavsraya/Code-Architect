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
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("Starting C# code analysis...");
        string directoryPath = args.Length > 0 ? args[0] : "path/to/cloned_repos";

        if (!Directory.Exists(directoryPath))
        {
            Console.WriteLine($"Directory not found: {directoryPath}");
            return;
        }

        string projectName = new DirectoryInfo(directoryPath).Name;
        string outputPath = $"/home/ec2-user/Code-Architect/C#/ProjectParse.txt";
        string jsonOutputPath = "/home/ec2-user/Code-Architect/NodeJs/GraphData.json";

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

        using (HttpClient client = new HttpClient())
        {
            HttpResponseMessage response = await client.GetAsync("http://184.73.72.205/Login/jason");
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseBody);
        }
    
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

    static void AnalyzeMainMethod(IMethodSymbol mainMethod, ClassInfo classInfo, SemanticModel semanticModel)
    {
        var mainSyntax = mainMethod.DeclaringSyntaxReferences.FirstOrDefault()?.GetSyntax() as MethodDeclarationSyntax;
        if (mainSyntax == null)
            return;

        var objectCreations = mainSyntax.DescendantNodes().OfType<ObjectCreationExpressionSyntax>();

        foreach (var creation in objectCreations)
        {
            var typeInfo = semanticModel.GetTypeInfo(creation);
            var createdClassName = typeInfo.Type.Name;

            if (!string.IsNullOrEmpty(createdClassName))
            {
                classInfo.Composition.Add(createdClassName);
            }
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

        //Interfaces
        foreach (var interfaceType in classSymbol.Interfaces)
        {
            classInfo.Interfaces.Add(interfaceType.Name);
        }

        foreach (var member in classSymbol.GetMembers().OfType<IMethodSymbol>())
        {
            if (member.MethodKind == MethodKind.Ordinary || 
                member.MethodKind == MethodKind.PropertyGet || 
                member.MethodKind == MethodKind.PropertySet)
            {
                // Add only ordinary methods and property methods to the methods section
                classInfo.Methods.Add(new MethodInfo
                {
                    Name = member.Name,
                    Accessibility = GetAccessModifier(member)
                });
            }

            // Analyze constructors separately for object creation (e.g., new Course())
            if (member.MethodKind == MethodKind.Constructor || member.MethodKind == MethodKind.Ordinary)
            {
                // Analyze both ordinary methods and constructors for object creation
                AnalyzeMainMethod(member, classInfo, semanticModel);  // This checks for new keyword (e.g., new Course())
            }
        }


        foreach (var enumNode in classNode.Members.OfType<EnumDeclarationSyntax>())
        {
            classInfo.Enums.Add(enumNode.Identifier.Text);
        }

        // Composition and Aggregation (fields and properties, collections-specific logic)
        var compositionCandidates = new HashSet<string>();
        var aggregationCandidates = new HashSet<string>();

        // Analyze fields
        foreach (var member in classSymbol.GetMembers().OfType<IFieldSymbol>())
        {
            if (member.Type != null && !IsPrimitiveType(member.Type.Name))
            {
                var typeName = GetElementTypeName(member.Type);

                // Check if the field is a collection and classify accordingly
                if (IsAggregationField(member, semanticModel))
                {
                    aggregationCandidates.Add(typeName);
                    Console.WriteLine($"Field {member.Name} ({typeName}) is classified as Aggregation.");
                }
            }
        }

        // Analyze properties
        foreach (var member in classSymbol.GetMembers().OfType<IPropertySymbol>())
        {
            if (member.Type != null && !IsPrimitiveType(member.Type.Name))
            {
                var typeName = GetElementTypeName(member.Type);

                // Check if the property is a collection and classify accordingly
                if (IsAggregationProperty(member, semanticModel))
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
        // Check if the property is a collection (generic type like List<Course>)
        if (propertySymbol.Type is INamedTypeSymbol namedTypeSymbol && namedTypeSymbol.IsGenericType)
        {
            // Check if the setter contains `new Course()`
            var setterMethod = propertySymbol.SetMethod?.DeclaringSyntaxReferences.FirstOrDefault()?.GetSyntax() as AccessorDeclarationSyntax;
            if (setterMethod != null)
            {
                var objectCreations = setterMethod.DescendantNodes().OfType<ObjectCreationExpressionSyntax>();
                foreach (var creation in objectCreations)
                {
                    var typeInfo = semanticModel.GetTypeInfo(creation);
                    if (typeInfo.Type.Name == "Course")  // Check for `new Course()`
                    {
                        return false;  // If `new Course()` is found, it's composition
                    }
                }
            }
            return true;  // If no `new Course()` is found, it's aggregation
        }

        // If not a collection, fallback to the original logic
        return false;
    }

    static bool IsAggregationField(IFieldSymbol fieldSymbol, SemanticModel semanticModel)
    {
        // Check if the field is a collection (generic type like List<Course>)
        if (fieldSymbol.Type is INamedTypeSymbol namedTypeSymbol && namedTypeSymbol.IsGenericType)
        {
            // Check if the initializer contains `new Course()`
            var syntaxReferences = fieldSymbol.DeclaringSyntaxReferences;
            foreach (var syntaxReference in syntaxReferences)
            {
                var fieldDeclaration = syntaxReference.GetSyntax() as VariableDeclaratorSyntax;
                if (fieldDeclaration != null)
                {
                    var initializer = fieldDeclaration.Initializer?.Value as ObjectCreationExpressionSyntax;
                    if (initializer != null && semanticModel.GetTypeInfo(initializer).Type.Name == "Course")  // Check for `new Course()`
                    {
                        return false;  // If `new Course()` is found, it's composition
                    }
                }
            }
            return true;  // If no `new Course()` is found, it's aggregation
        }

        // If not a collection, fallback to the original logic
        return false;
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

            if (classInfo.InheritsFrom != null || 
                classInfo.Composition.Any() || 
                classInfo.Aggregations.Any() || 
                classInfo.NestedClasses.Any() ||
                classInfo.Interfaces.Any())
            {
                streamWriter.WriteLine("  Dependencies:");

                if (!string.IsNullOrEmpty(classInfo.InheritsFrom))
                {
                    streamWriter.WriteLine("    Inheritance:");
                    streamWriter.WriteLine($"      Inherits from: {classInfo.InheritsFrom}");
                }

                if (classInfo.Interfaces.Any())
                {
                    streamWriter.WriteLine("    Interfaces:");
                    foreach (var iface in classInfo.Interfaces)
                    {
                        streamWriter.WriteLine($"      {iface}");
                    }
                }

                var nonPrimitiveComponents = classInfo.Composition.Where(c => !IsPrimitiveType(c)).ToList();
                if (nonPrimitiveComponents.Any())
                {
                    streamWriter.WriteLine("    Composition:");
                    foreach (var component in nonPrimitiveComponents)
                    {
                        streamWriter.WriteLine($"      {component}");
                    }
                }

                var nonPrimitiveAggregations = classInfo.Aggregations.Where(a => !IsPrimitiveType(a)).ToList();
                if (nonPrimitiveAggregations.Any())
                {
                    streamWriter.WriteLine("    Aggregations:");
                    foreach (var aggregation in nonPrimitiveAggregations)
                    {
                        streamWriter.WriteLine($"      {aggregation}");
                    }
                }

                if (classInfo.NestedClasses.Any())
                {
                    streamWriter.WriteLine("    Nested Classes:");
                    foreach (var nestedClass in classInfo.NestedClasses)
                    {
                        streamWriter.WriteLine($"      {nestedClass.ClassName}");
                    }
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
        }

        var classInfosForJson = classInfos.Select(classInfo => new
        {
            classInfo.FolderName,
            classInfo.ClassName,
            classInfo.Accessibility,
            classInfo.InheritsFrom,
            Compositions = classInfo.Composition.ToList(),
            Aggregations = classInfo.Aggregations.ToList(),
            NestedClasses = classInfo.NestedClasses,
            Methods = classInfo.Methods.Select(m => $"{GetVisibilitySign(m.Accessibility)} {m.Name}").ToList(),
            Enums = classInfo.Enums,
            Interfaces = classInfo.Interfaces
        }).ToList();

        var json = JsonConvert.SerializeObject(classInfosForJson, Formatting.Indented);
        File.WriteAllText(jsonOutputPath, json);
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
    public List<MethodInfo> Methods { get; set; } = new List<MethodInfo>();
    public List<string> Enums { get; set; } = new List<string>();
    public HashSet<string> Usage { get; set; } = new HashSet<string>();
    public List<string> Interfaces { get; set; } = new List<string>();
}

class MethodInfo
{
    public string Name { get; set; }
    public string Accessibility { get; set; }
}
