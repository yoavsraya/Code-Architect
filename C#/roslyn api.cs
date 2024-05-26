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
                componentTypes.Add(member.Type);
            }
            foreach (var member in classSymbol.GetMembers().OfType<IPropertySymbol>())
            {
                componentTypes.Add(member.Type);
            }

            if (componentTypes.Any())
            {
                Console.WriteLine("  Composition (components):");
                foreach (var type in componentTypes)
                {
                    Console.WriteLine($"    {type}");
                }
            }

            // References (method parameters)
            var referenceTypes = new HashSet<ITypeSymbol>();
            foreach (var method in classSymbol.GetMembers().OfType<IMethodSymbol>())
            {
                foreach (var parameter in method.Parameters)
                {
                    referenceTypes.Add(parameter.Type);
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
}
