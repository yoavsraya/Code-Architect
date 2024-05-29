using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.MSBuild;

class Program
{
    static void Main(string[] args)
    {
        string directoryPath = args.Length > 0 ? args[0] : "path/to/cloned_repos";
        string outputPath = "Parser Output.txt";

        if (!Directory.Exists(directoryPath))
        {
            Console.WriteLine($"Directory not found: {directoryPath}");
            return;
        }

        using (StreamWriter streamWriter = new StreamWriter(outputPath))
        {
            string projectName = new DirectoryInfo(directoryPath).Name;
            streamWriter.WriteLine($"Project: {projectName}");

            var files = Directory.GetFiles(directoryPath, "*.cs", SearchOption.AllDirectories);

            foreach (var file in files)
            {
                AnalyzeFile(file, streamWriter);
            }
        }
    }

    static void AnalyzeFile(string filePath, StreamWriter streamWriter)
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
            var classSymbol = semanticModel.GetDeclaredSymbol(classNode) as INamedTypeSymbol;

            streamWriter.WriteLine($"Class: {classSymbol.Name}");

            // Inheritance
            var baseType = classSymbol.BaseType;
            if (baseType != null && baseType.Name != "Object")
            {
                streamWriter.WriteLine($"  Inherits from: {baseType}");
            }

            // Composition (fields and properties)
            var componentTypes = new HashSet<ITypeSymbol>();
            foreach (var member in classSymbol.GetMembers().OfType<IFieldSymbol>())
            {
                if (member.Type != null && !IsSystemNamespaceOrEnum(member.Type))
                {
                    componentTypes.Add(member.Type);
                }
            }
            foreach (var member in classSymbol.GetMembers().OfType<IPropertySymbol>())
            {
                if (member.Type != null && !IsSystemNamespaceOrEnum(member.Type))
                {
                    componentTypes.Add(member.Type);
                }
            }

            if (componentTypes.Any())
            {
                streamWriter.WriteLine("  Composition (components):");
                foreach (var type in componentTypes)
                {
                    streamWriter.WriteLine($"    {type}");
                }
            }

            // Methods
            var methods = classSymbol.GetMembers().OfType<IMethodSymbol>().Where(m => m.MethodKind == MethodKind.Ordinary);
            if (methods.Any())
            {
                streamWriter.WriteLine("  Methods:");
                foreach (var method in methods)
                {
                    streamWriter.WriteLine($"    {GetAccessModifier(method)} {method.Name}()");
                }
            }

            // References (method parameters)
            var referenceTypes = new HashSet<ITypeSymbol>();
            foreach (var method in methods)
            {
                foreach (var parameter in method.Parameters)
                {
                    if (parameter.Type != null && !IsSystemNamespaceOrEnum(parameter.Type))
                    {
                        referenceTypes.Add(parameter.Type);
                    }
                }
            }

            if (referenceTypes.Any())
            {
                streamWriter.WriteLine("  References:");
                foreach (var type in referenceTypes)
                {
                    streamWriter.WriteLine($"    {type}");
                }
            }

            streamWriter.WriteLine();
        }
    }

    static string GetAccessModifier(IMethodSymbol methodSymbol)
    {
        switch (methodSymbol.DeclaredAccessibility)
        {
            case Accessibility.Public:
                return "public";
            case Accessibility.Private:
                return "private";
            case Accessibility.Protected:
                return "protected";
            case Accessibility.Internal:
                return "internal";
            case Accessibility.ProtectedOrInternal:
                return "protected internal";
            default:
                return "private"; // Default to private if none of the above
        }
    }

    static bool IsSystemNamespaceOrEnum(ITypeSymbol typeSymbol)
    {
        if (typeSymbol == null || typeSymbol.ContainingNamespace == null) return false;
        return typeSymbol.ContainingNamespace.ToString().StartsWith("System") || typeSymbol.TypeKind == TypeKind.Enum;
    }
}

