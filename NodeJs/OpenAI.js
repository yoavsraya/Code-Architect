const OpenAI = require("openai");
const path = require('path');

try
{
  const dotenvPath = path.join(__dirname, '../.env');
  require('dotenv').config({ path: dotenvPath });
}
catch (error)
{
  console.error('Error loading .env file:', error);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

const fs = require('fs');
const { Module } = require("module");
const filePath = '/home/ec2-user/Code-Analyzer/C#/ProjectParse.txt';
const UserProjectStructure = fs.readFileSync(filePath, 'utf-8');

async function RunAI() {
    const completion = await openai.chat.completions.create({
      messages: [{"role": "system", "content": "code designer"},

          {"role": "user", "content":"Im going to give you high-level codes and you will Analyze my code structure and provide feedback on its design, particularly focusing on opportunities to leverage well-suited design patterns and improve adherence to OOP principles. Additionally, highlight well-designed parts of my code and explain why they are effective. I dont want you to show me practical code examples. be essential. wait for my high-level code. Im going to show your answer in my website so you can edit the answer with HTML code to look beautiful and understandble. In addition, please split your answer to number of messages please split them wise and redable."},

          {"role": "assistant", "content": "Absolutely, I'd be happy to help with that. Please go ahead and share your high-level code, and I'll provide a detailed analysis and feedback on its design, focusing on design patterns, OOP principles, and highlighting well-designed parts. I'll also ensure the feedback is split into multiple, readable messages and formatted in HTML for your website."},

          {"role": "user", "content":
          `Project: Garage-Manager

            Folder: Ex03.ConsoleUI
            File: Program.cs
            Class: Program
              Accessibility: internal
              Belongs to: EXE
              Object Creation:
                System.Collections.Generic.List<string>
                System.IO.StreamWriter

            Folder: Ex03.ConsoleUI
            File: TUI.cs
            Class: TUI
              Accessibility: public
              Belongs to: EXE
              Composition (components):
                GarageManager
                CreatingObject
              Object Creation:
                GarageManager
                CreatingObject
                System.Collections.Generic.List<string>

            Folder: Ex03.GarageLogic
            File: Car.cs
            Class: Car
              Accessibility: internal
              Belongs to: DLL
              Inherits from: Vehicle
              Composition (components):
                Ex03.GarageLogic.Car.eNumOfDoors
                Ex03.GarageLogic.Car.eCarColor
              Object Creation:
                Wheels
                Track
                System.Collections.Generic.List<string>
                System.ArgumentException
                System.FormatException
                System.NullReferenceException

            Folder: Ex03.GarageLogic
            File: CarExistException.cs
            Class: CarExistException
              Accessibility: public
              Belongs to: DLL
              Inherits from: Exception

            Folder: Ex03.GarageLogic
            File: ClientInfo.cs
            Class: ClientInfo
              Accessibility: internal
              Belongs to: DLL
              Composition (components):
                Vehicle
                Ex03.GarageLogic.ClientInfo.eClientStatus

            Folder: Ex03.GarageLogic
            File: CreatingObject.cs
            Class: CreatingObject
              Accessibility: public
              Belongs to: DLL
              Composition (components):
                Vehicle
              Object Creation:
                CarExistException
                System.FormatException
                Car
                MotorBike
                Track

            Folder: Ex03.GarageLogic
            File: ElectricMotor.cs
            Class: ElectricMotor
              Accessibility: internal
              Belongs to: DLL
              Inherits from: MotorType
              Object Creation:
                System.ArgumentException
                fillEnergyToMaxException

            Folder: Ex03.GarageLogic
            File: fillEnergyToMaxException.cs
            Class: fillEnergyToMaxException
              Accessibility: public
              Belongs to: DLL
              Inherits from: Exception

            Folder: Ex03.GarageLogic
            File: GarageManeger.cs
            Class: GarageManager
              Accessibility: public
              Belongs to: DLL
              Composition (components):
                System.Collections.Generic.Dictionary<ClientInfo.eClientStatus, System.Collections.Generic.List<ClientInfo>>
                ClientInfo.eClientStatus
                System.Collections.Generic.List<ClientInfo>
              Object Creation:
                System.Collections.Generic.Dictionary<ClientInfo.eClientStatus, System.Collections.Generic.List<ClientInfo>>
                System.ArgumentException
                System.Collections.Generic.List<string>
                System.FormatException
                System.Collections.Generic.List<ClientInfo>
                System.ArgumentNullException
                ClientInfo

            Folder: Ex03.GarageLogic
            File: GasMotor.cs
            Class: GasMotor
              Accessibility: internal
              Belongs to: DLL
              Inherits from: MotorType
              Object Creation:
                System.ArgumentException
                fillEnergyToMaxException

            Folder: Ex03.GarageLogic
            File: MotorBike.cs
            Class: MotorBike
              Accessibility: internal
              Belongs to: DLL
              Inherits from: Vehicle
              Composition (components):
                Ex03.GarageLogic.MotorBike.eLicenseType
              Object Creation:
                Wheels
                System.Collections.Generic.List<string>
                System.ArgumentException
                System.FormatException
                System.NullReferenceException

            Folder: Ex03.GarageLogic
            File: MotorType.cs
            Class: MotorType
              Accessibility: public
              Belongs to: DLL
              Composition (components):
                Ex03.GarageLogic.MotorType.eEnergyType
              Object Creation:
                System.AggregateException

            Folder: Ex03.GarageLogic
            File: Track.cs
            Class: Track
              Accessibility: internal
              Belongs to: DLL
              Inherits from: Vehicle
              Object Creation:
                Wheels
                System.Collections.Generic.List<string>
                System.AggregateException
                System.FormatException
                GasMotor
                System.NullReferenceException

            Folder: Ex03.GarageLogic
            File: ValueOutOfRangeException.cs
            Class: ValueOutOfRangeException
              Accessibility: public
              Belongs to: DLL
              Inherits from: Exception

            Folder: Ex03.GarageLogic
            File: vehicle.cs
            Class: Vehicle
              Accessibility: public
              Belongs to: DLL
              Composition (components):
                MotorType
                Wheels
                System.Collections.Generic.List<Car>
                Car
              Object Creation:
                System.Collections.Generic.List<Car>
                System.ArgumentException
                System.ArgumentNullException
                System.NullReferenceException
                ElectricMotor
                GasMotor
                System.Collections.Generic.List<string>

            Folder: Ex03.GarageLogic
            File: Wheels.cs
            Class: Wheels
              Accessibility: public
              Belongs to: DLL
              Object Creation:
                System.ArgumentException

            `},

          {"role": "assistant", "content": `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Garage Manager Code Analysis</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      margin: 20px;
                  }
                  h2 {
                      color: #2c3e50;
                  }
                  p {
                      margin: 10px 0;
                  }
                  .highlight {
                      background-color: #f9f9f9;
                      border-left: 5px solid #3498db;
                      padding: 10px;
                      margin: 10px 0;
                  }
              </style>
          </head>
          <body>
              <h2>Garage Manager Code Analysis</h2>
              <p>Below is the analysis of your high-level code structure for the Garage Manager project. The feedback is split into multiple sections for better readability.</p>

              <div class="highlight">
                  <h3>1. Overall Structure and Organization</h3>
                  <p>Your project is well-organized into different folders and files, which helps in maintaining a clear separation of concerns. The use of namespaces and internal accessibility for certain classes ensures encapsulation and limits the scope of these classes to within the assembly.</p>
              </div>

              <div class="highlight">
                  <h3>2. Adherence to OOP Principles</h3>
                  <p>Most of your classes adhere to OOP principles such as encapsulation, inheritance, and composition. For example, the <code>Car</code> class inherits from <code>Vehicle</code>, and the <code>ElectricMotor</code> and <code>GasMotor</code> classes inherit from <code>MotorType</code>. This demonstrates a good use of inheritance to promote code reuse and polymorphism.</p>
              </div>

              <div class="highlight">
                  <h3>3. Use of Design Patterns</h3>
                  <p>There are opportunities to leverage design patterns to improve your code structure:</p>
                  <ul>
                      <li><strong>Factory Pattern:</strong> The <code>CreatingObject</code> class is responsible for creating instances of various vehicle types. This can be refactored to use the Factory Pattern, which will encapsulate the object creation logic and make it easier to manage and extend.</li>
                      <li><strong>Singleton Pattern:</strong> If the <code>GarageManager</code> class is intended to manage a single instance of the garage, consider using the Singleton Pattern to ensure only one instance of this class exists throughout the application.</li>
                      <li><strong>Strategy Pattern:</strong> The different motor types (ElectricMotor, GasMotor) can benefit from the Strategy Pattern to encapsulate the varying behaviors related to energy management.</li>
                  </ul>
              </div>

              <div class="highlight">
                  <h3>4. Exception Handling</h3>
                  <p>Your code includes custom exceptions such as <code>CarExistException</code> and <code>fillEnergyToMaxException</code>. This is a good practice as it provides more meaningful error messages and helps in debugging. Ensure that these exceptions are used consistently across your application to handle specific error scenarios.</p>
              </div>

              <div class="highlight">
                  <h3>5. Composition and Object Creation</h3>
                  <p>The use of composition in classes like <code>Vehicle</code> and <code>GarageManager</code> is effective in building complex objects from simpler ones. However, consider using dependency injection to manage object creation, which will make your code more testable and flexible.</p>
              </div>

              <div class="highlight">
                  <h3>6. Well-Designed Parts</h3>
                  <p>The <code>Vehicle</code> class is well-designed with a clear composition of components like <code>MotorType</code> and <code>Wheels</code>. This modular approach makes it easier to extend and maintain the code. Additionally, the use of enums for properties like <code>eNumOfDoors</code> and <code>eCarColor</code> in the <code>Car</code> class enhances code readability and type safety.</p>
              </div>

              <p>Overall, your code demonstrates a solid understanding of OOP principles and good practices. By incorporating some design patterns and refining object creation and exception handling, you can further enhance the maintainability and scalability of your project.</p>
          </body>

          This HTML code provides a structured and readable analysis of your high-level code. It highlights the strengths of your design and suggests improvements, particularly focusing on design patterns and OOP principles. Feel free to adjust the content as needed for your website.`},
         
          {"role": "user", "content": `This HTML code provides a structured and readable analysis of your high-level code. It highlights the strengths of your design and suggests improvements, particularly focusing on design patterns and OOP principles. Feel free to adjust the content as needed for your website."
          this paragraph is useless

          please make these lines more beautiful with the HTML: 
          1. <p>Below is the analysis of your high-level code structure for the Garage Manager project. The feedback is split into multiple sections for better readability.</p>

          2.<p>Overall, your code demonstrates a solid understanding of OOP principles and good practices. By incorporating some design patterns and refining object creation and exception handling, you can further enhance the maintainability and scalability of your project.</p>`},

          {"role": "assistant", "content": `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Garage Manager Code Analysis</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      margin: 20px;
                  }
                  h2 {
                      color: #2c3e50;
                  }
                  p {
                      margin: 10px 0;
                  }
                  .highlight {
                      background-color: #f9f9f9;
                      border-left: 5px solid #3498db;
                      padding: 10px;
                      margin: 10px 0;
                  }
                  .intro, .conclusion {
                      background-color: #e8f4f8;
                      border-left: 5px solid #1abc9c;
                      padding: 10px;
                      margin: 10px 0;
                  }
              </style>
          </head>
          <body>
              <h2>Garage Manager Code Analysis</h2>
              <div class="intro">
                  <p>Below is the analysis of your high-level code structure for the Garage Manager project. The feedback is split into multiple sections for better readability.</p>
              </div>

              <div class="highlight">
                  <h3>1. Overall Structure and Organization</h3>
                  <p>Your project is well-organized into different folders and files, which helps in maintaining a clear separation of concerns. The use of namespaces and internal accessibility for certain classes ensures encapsulation and limits the scope of these classes to within the assembly.</p>
              </div>

              <div class="highlight">
                  <h3>2. Adherence to OOP Principles</h3>
                  <p>Most of your classes adhere to OOP principles such as encapsulation, inheritance, and composition. For example, the <code>Car</code> class inherits from <code>Vehicle</code>, and the <code>ElectricMotor</code> and <code>GasMotor</code> classes inherit from <code>MotorType</code>. This demonstrates a good use of inheritance to promote code reuse and polymorphism.</p>
              </div>

              <div class="highlight">
                  <h3>3. Use of Design Patterns</h3>
                  <p>There are opportunities to leverage design patterns to improve your code structure:</p>
                  <ul>
                      <li><strong>Factory Pattern:</strong> The <code>CreatingObject</code> class is responsible for creating instances of various vehicle types. This can be refactored to use the Factory Pattern, which will encapsulate the object creation logic and make it easier to manage and extend.</li>
                      <li><strong>Singleton Pattern:</strong> If the <code>GarageManager</code> class is intended to manage a single instance of the garage, consider using the Singleton Pattern to ensure only one instance of this class exists throughout the application.</li>
                      <li><strong>Strategy Pattern:</strong> The different motor types (ElectricMotor, GasMotor) can benefit from the Strategy Pattern to encapsulate the varying behaviors related to energy management.</li>
                  </ul>
              </div>

              <div class="highlight">
                  <h3>4. Exception Handling</h3>
                  <p>Your code includes custom exceptions such as <code>CarExistException</code> and <code>fillEnergyToMaxException</code>. This is a good practice as it provides more meaningful error messages and helps in debugging. Ensure that these exceptions are used consistently across your application to handle specific error scenarios.</p>
              </div>

              <div class="highlight">
                  <h3>5. Composition and Object Creation</h3>
                  <p>The use of composition in classes like <code>Vehicle</code> and <code>GarageManager</code> is effective in building complex objects from simpler ones. However, consider using dependency injection to manage object creation, which will make your code more testable and flexible.</p>
              </div>

              <div class="highlight">
                  <h3>6. Well-Designed Parts</h3>
                  <p>The <code>Vehicle</code> class is well-designed with a clear composition of components like <code>MotorType</code> and <code>Wheels</code>. This modular approach makes it easier to extend and maintain the code. Additionally, the use of enums for properties like <code>eNumOfDoors</code> and <code>eCarColor</code> in the <code>Car</code> class enhances code readability and type safety.</p>
              </div>

              <div class="conclusion">
                  <p>Overall, your code demonstrates a solid understanding of OOP principles and good practices. By incorporating some design patterns and refining object creation and exception handling, you can further enhance the maintainability and scalability of your project.</p>
              </div>
          </body>`},

          {"role": "user", "content": "good! ready for more code?"},

          {"role": "assistant", "content": "Absolutely, I'm ready for more code. Please go ahead and share the next part of your high-level code, and I'll continue with the analysis and feedback."},
        
          {role: "user", content: UserProjectStructure}],
      model: "gpt-4o",
    });
  
    return JSON.stringify(completion.choices[0]);
  }
  
  module.exports = {
    RunAI,
  };