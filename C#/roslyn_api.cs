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

        if (!Directory.Exists(directoryPath))
        {
            Console.WriteLine($"Directory not found: {directoryPath}");
            return;
        }

        var files = Directory.GetFiles(directoryPath, "*.cs", SearchOption.AllDirectories);

        foreach (var file in files)
        {
            AnalyzeFile(file);
        }
    }

    static void AnalyzeFile(string filePath)
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

            Console.WriteLine($"Class: {classSymbol.Name}");

            // Inheritance
            var baseType = classSymbol.BaseType;
            if (baseType != null && baseType.Name != "Object")
            {
                Console.WriteLine($"  Inherits from: {baseType}");
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
                Console.WriteLine("  Composition (components):");
                foreach (var type in componentTypes)
                {
                    Console.WriteLine($"    {type}");
                }
            }

            // Methods
            var methods = classSymbol.GetMembers().OfType<IMethodSymbol>().Where(m => m.MethodKind == MethodKind.Ordinary);
            if (methods.Any())
            {
                Console.WriteLine("  Methods:");
                foreach (var method in methods)
                {
                    Console.WriteLine($"    {GetAccessModifier(method)} {method.Name}()");
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
                Console.WriteLine("  References:");
                foreach (var type in referenceTypes)
                {
                    Console.WriteLine($"    {type}");
                }
            }

            Console.WriteLine();
        }
    }

    static string GetAccessModifier(IMethodSymbol methodSymbol)
    {
        if (methodSymbol.DeclaredAccessibility == Accessibility.Public)
        {
            return "public";
        }
        else if (methodSymbol.DeclaredAccessibility == Accessibility.Private)
        {
            return "private";
        }
        else if (methodSymbol.DeclaredAccessibility == Accessibility.Protected)
        {
            return "protected";
        }
        else if (methodSymbol.DeclaredAccessibility == Accessibility.Internal)
        {
            return "internal";
        }
        else if (methodSymbol.DeclaredAccessibility == Accessibility.ProtectedOrInternal)
        {
            return "protected internal";
        }
        else
        {
            return "private"; // Default to private if none of the above
        }
    }

    static bool IsSystemNamespaceOrEnum(ITypeSymbol typeSymbol)
{
    if (typeSymbol == null || typeSymbol.ContainingNamespace == null) return false;
    return typeSymbol.ContainingNamespace.ToString().StartsWith("System") || typeSymbol.TypeKind == TypeKind.Enum;
}
}
