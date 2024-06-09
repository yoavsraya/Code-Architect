using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Newtonsoft.Json;

class Program
{
    static void Main(string[] args)
    {
        string directoryPath = args.Length > 0 ? args[0] : "path/to/cloned_repos";

        if (!Directory.Exists(directoryPath))
        {
            Console.WriteLine($"Directory not found: {directoryPath}");
            return;
        }

        string projectName = new DirectoryInfo(directoryPath).Name;
        string outputPath = $"{projectName} Parse.txt";
        string jsonOutputPath = $"{projectName} Classes.json";

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
            var classInfo = new ClassInfo
            {
                FolderName = Path.GetFileName(Path.GetDirectoryName(filePath)),
                FileName = Path.GetFileName(filePath),
                ClassName = classNode.Identifier.Text,
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

        // Composition (fields and properties)
        foreach (var member in classSymbol.GetMembers().OfType<IFieldSymbol>())
        {
            if (member.Type != null && !IsPrimitiveType(member.Type.Name))
            {
                AddComponentTypes(classInfo.Composition, member.Type);
            }
        }
        foreach (var member in classSymbol.GetMembers().OfType<IPropertySymbol>())
        {
            if (member.Type != null && !IsPrimitiveType(member.Type.Name))
            {
                AddComponentTypes(classInfo.Composition, member.Type);
            }
        }

        // Object Creation
        var objectCreationExpressions = classNode.DescendantNodes().OfType<ObjectCreationExpressionSyntax>();
        foreach (var creationExpression in objectCreationExpressions)
        {
            var typeInfo = semanticModel.GetTypeInfo(creationExpression).Type;
            if (typeInfo != null && !IsPrimitiveType(typeInfo.Name))
            {
                classInfo.CreationObjects.Add(typeInfo.ToString());
            }
        }

        // Methods
        var methods = classSymbol.GetMembers().OfType<IMethodSymbol>()
            .Where(m => m.MethodKind == MethodKind.Ordinary)
            .Select(m => m.Name)
            .Distinct()
            .ToList();
        classInfo.Methods.AddRange(methods);

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

    static void AddComponentTypes(HashSet<string> componentTypes, ITypeSymbol typeSymbol)
    {
        if (typeSymbol is INamedTypeSymbol namedTypeSymbol && namedTypeSymbol.IsGenericType)
        {
            componentTypes.Add(namedTypeSymbol.ToString());
            foreach (var typeArg in namedTypeSymbol.TypeArguments)
            {
                if (!IsPrimitiveType(typeArg.Name))
                {
                    componentTypes.Add(typeArg.ToString());
                }
            }
        }
        else if (typeSymbol is IArrayTypeSymbol arrayTypeSymbol)
        {
            componentTypes.Add($"Array<{arrayTypeSymbol.ElementType}>");
            AddComponentTypes(componentTypes, arrayTypeSymbol.ElementType);
        }
        else
        {
            if (!IsPrimitiveType(typeSymbol.Name))
            {
                componentTypes.Add(typeSymbol.ToString());
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
            "bool", "byte", "sbyte", "char", "decimal", "double", "float", "int", "uint", "long", "ulong", "short", "ushort", "string"
        };
        return primitiveTypes.Contains(typeName);
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
                streamWriter.WriteLine("  Composition (components):");
                foreach (var component in nonPrimitiveComponents)
                {
                    streamWriter.WriteLine($"    {component}");
                }
            }

            if (classInfo.CreationObjects.Any())
            {
                streamWriter.WriteLine("  Object Creation:");
                foreach (var creationObject in classInfo.CreationObjects)
                {
                    streamWriter.WriteLine($"    {creationObject}");
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
        // Filter out primitive types from the composition
        foreach (var classInfo in classInfos)
        {
            classInfo.Composition = new HashSet<string>(classInfo.Composition.Where(c => !IsPrimitiveType(c)));
        }

        // Create a new list to hold ClassInfo objects without the FileName and ProjectType properties for JSON serialization
        var classInfosForJson = classInfos.Select(classInfo => new
        {
            classInfo.FolderName,
            classInfo.ClassName,
            classInfo.Accessibility,
            classInfo.InheritsFrom,
            Compositions = classInfo.Composition.Where(c => !IsPrimitiveType(c)).ToList(),
            classInfo.CreationObjects,
            classInfo.Methods,
            classInfo.NestedClasses
        }).ToList();

        var json = JsonConvert.SerializeObject(classInfosForJson, Formatting.Indented);
        File.WriteAllText(jsonOutputPath, json);
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
    public HashSet<string> CreationObjects { get; set; } = new HashSet<string>();
    public List<string> Methods { get; set; } = new List<string>();
    public List<ClassInfo> NestedClasses { get; set; } = new List<ClassInfo>();
}
