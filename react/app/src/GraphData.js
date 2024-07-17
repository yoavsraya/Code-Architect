// src/GraphData.js
import jsonData from './GraphData.json';

let Vertices = [];
let Edges = [];
let FolderCounter = 0;
let folderNames = [];
let isContiener = false;

function SetLabel(name)
{
  if(isContiener == true)
    {
      return name + "(continer)"
    }
    
    return name;
}

function findLabelVertexIndex(name) {
  return Vertices.findIndex(vertex => vertex.Label === name);
}

function GetFolderIndex(folderName)
{
  let newItem;

  for (let item of folderNames) {
    if (item.Name === folderName)
    {
      newItem = item.Index;
      break;
    }
  }

  newItem = { Name: folderName, Index: ++FolderCounter };
  folderNames.push(newItem);
  return newItem.Index;
}


async function createGraphFromData()
{
  const verticesLookup = [];
  jsonData.forEach(vertex =>{
    Vertices.push({Label: vertex.ClassName, FolderIndex: GetFolderIndex(vertex.FolderName) , degree: 0, methods : vertex.Methods})
    verticesLookup.push(vertex.ClassName)
  })
  console.log("Vertices");
  console.log(Vertices);
  console.log("verticesLookup");
  console.log(verticesLookup);

  jsonData.forEach(vertex => {
    const inhertageName = vertex.InheritsFrom;
    if(inhertageName != null)
      {
        if(verticesLookup.includes(inhertageName))
        {
          Edges.push({From : vertex.ClassName, To : vertex.InheritsFrom, Label: "heritage"});
        }
      }
      
      vertex.Compositions.forEach(Composition => {
        isContiener = false;
        if(Composition.startsWith("System.Collections.Generic."))
          {
            isContiener = true;
            Composition = Composition.match(/<(.*)>/)[1];
          }

        if(verticesLookup.includes(Composition))
          {
            Edges.push({From : vertex.ClassName, To : Composition , Label: SetLabel("Composition")})
          }
      })
      
      vertex.CreationObjects.forEach(CreationObject => {
        isContiener = false;
        if(CreationObject.startsWith("System.Collections.Generic."))
        {
          isContiener = true;
          CreationObject = CreationObject.match(/<(.*)>/)[1];
        }

        if(verticesLookup.includes(CreationObject))
        {
          Edges.push({From : vertex.ClassName, To : CreationObject , Label: SetLabel("Creating")})
        }
      })
      vertex.NestedClasses.forEach(NestedClasse => {
        isContiener = false;
        if(NestedClasse.startsWith("System.Collections.Generic."))
          {
            isContiener = true;
            NestedClasse = NestedClasse.match(/<(.*)>/)[1];
          }

        if(verticesLookup.includes(NestedClasse))
          {
            Edges.push({From : vertex.ClassName, To : NestedClasse , Label: SetLabel("Nested")})
          }
      })

  }); 

  Edges.forEach(edge => {
    const fromIndex = findLabelVertexIndex(edge.From);
    const toIndex = findLabelVertexIndex(edge.To);
    if (fromIndex !== -1) {
      Vertices[fromIndex].degree++;
    }
    if (toIndex !== -1) {
      Vertices[toIndex].degree++;
    }
  });

  console.log(Vertices);
  console.log(Edges);
  return {Vertices, Edges}
}

export default createGraphFromData;
