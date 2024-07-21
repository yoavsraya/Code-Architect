const fs = require('fs');

const filePath = '/home/ec2-user/Code-Analyzer/C#/ProjectParse.txt';
const UserProjectStructure = fs.readFileSync(filePath, 'utf-8');

const InitAIConversation = [
  { "role": "system", "content": "code designer" },
  {
    "role": "user",
    "content": "I'm going to give you high-level codes and you will analyze my code structure and provide feedback on its design, particularly focusing on opportunities to leverage well-suited design patterns and improve adherence to OOP principles. Additionally, highlight well-designed parts of my code and explain why they are effective. I don't want you to show me practical code examples. Be essential. Wait for my high-level code. I'm going to show your answer on my website, so you can edit the answer with HTML code to look beautiful and understandable. In addition, please split your answer into a number of messages. Please split them wisely and make them readable."
  },
  {
    "role": "assistant",
    "content": "Absolutely, I'd be happy to help with that. Please go ahead and share your high-level code, and I'll provide a detailed analysis and feedback on its design, focusing on design patterns, OOP principles, and highlighting well-designed parts. I'll also ensure the feedback is split into multiple, readable messages and formatted in HTML for your website."
  },
  {
    "role": "user",
    "content": `
      Project: Garage-Manager

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
    `
  },
  {
    "role": "assistant",
    "content": `
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
          <p>Below is a detailed analysis of your Garage Manager project, focusing on design patterns, OOP principles, and highlighting well-designed parts of your code.</p>
          
          <div class="highlight">
              <h3>1. Overall Structure</h3>
              <p>Your project is well-organized into different folders and files, separating the console UI from the logic layer. This separation of concerns is a good practice as it makes the code more maintainable and scalable.</p>
          </div>
          
          <div class="highlight">
              <h3>2. Object-Oriented Principles</h3>
              <p>Let's analyze how well your code adheres to OOP principles:</p>
              <ul>
                  <li><strong>Encapsulation:</strong> Most of your classes have internal accessibility, which is good for encapsulating the logic within the assembly. However, consider making some classes or methods private if they are not intended to be accessed outside their class.</li>
                  <li><strong>Inheritance:</strong> You have a clear inheritance hierarchy, such as <code>Car</code>, <code>MotorBike</code>, and <code>Track</code> inheriting from <code>Vehicle</code>. This promotes code reuse and polymorphism.</li>
                  <li><strong>Polymorphism:</strong> Ensure that you are leveraging polymorphism effectively by using base class references to interact with derived class objects.</li>
                  <li><strong>Abstraction:</strong> Your use of abstract classes like <code>Vehicle</code> and <code>MotorType</code> is effective in providing a common interface for derived classes.</li>
              </ul>
          </div>
          
          <div class="highlight">
              <h3>3. Design Patterns</h3>
              <p>Here are some design patterns that could be beneficial for your project:</p>
              <ul>
                  <li><strong>Factory Pattern:</strong> The <code>CreatingObject</code> class is a good candidate for the Factory pattern. It can be used to create instances of different vehicle types without exposing the instantiation logic to the client.</li>
                  <li><strong>Singleton Pattern:</strong> If <code>GarageManager</code> is intended to be a single instance throughout the application, consider implementing the Singleton pattern to ensure only one instance is created.</li>
                  <li><strong>Strategy Pattern:</strong> If you have different algorithms for managing vehicles, you can encapsulate them in separate classes and use the Strategy pattern to switch between them dynamically.</li>
              </ul>
          </div>
          
          <div class="highlight">
              <h3>4. Exception Handling</h3>
              <p>Your custom exceptions like <code>CarExistException</code> and <code>fillEnergyToMaxException</code> are well-designed. They provide specific error handling and make the code more readable and maintainable.</p>
          </div>
          
          <div class="highlight">
              <h3>5. Well-Designed Parts</h3>
              <p>Here are some well-designed parts of your code:</p>
              <ul>
                  <li><strong>Separation of Concerns:</strong> The separation between the UI layer and the logic layer is well-maintained, making the code more modular and easier to manage.</li>
                  <li><strong>Use of Collections:</strong> The use of collections like <code>List</code> and <code>Dictionary</code> in <code>GarageManager</code> is effective for managing client and vehicle data.</li>
                  <li><strong>Custom Exceptions:</strong> Your custom exceptions provide clear and specific error messages, which is a good practice for debugging and maintenance.</li>
              </ul>
          </div>
          
          <div class="highlight">
              <h3>6. Areas for Improvement</h3>
              <p>Here are some areas where you can improve your code:</p>
              <ul>
                  <li><strong>Accessibility Modifiers:</strong> Review the accessibility modifiers of your classes and methods. Make them as restrictive as possible to enhance encapsulation.</li>
                  <li><strong>Design Patterns:</strong> Implement the suggested design patterns to make your code more flexible and maintainable.</li>
                  <li><strong>Code Duplication:</strong> Look for any code duplication and refactor it into reusable methods or classes.</li>
              </ul>
          </div>
      </body>
      </html>`
  },
  {
    "role": "user",
    "content": `For next time: 3 fixes:
    1. Don't summarize like this: This HTML code provides a structured and readable analysis of your high-level code. It highlights the strengths of your design and suggests improvements, particularly focusing on design patterns and OOP principles. Feel free to adjust the content as needed for your website.

    2. Please don't put background at all

    3. This is the style for you to use:  
    <style>
      body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
      }
      h2 {
          color: #e74c3c;
          margin: 0;
          padding: 10px; /* Adjust padding to ensure alignment */
      }
      p {
          margin: 0;
          padding: 10px; /* Adjust padding to ensure alignment */
      }
      .highlight {
          border-left: 5px solid #3498db;
          padding: 10px;
          margin: 0; /* Remove margin */
      }
      .intro, .conclusion {
          border-left: 5px solid #1abc9c;
          padding: 10px;
          margin: 0; /* Remove margin */
      }
    </style>`
  },
  {
    "role": "assistant",
    "content": `
    Got it! I'll make sure to follow your guidelines for the next time. Here is the revised HTML content based on your feedback:
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
                margin: 0;
                padding: 0;
            }
            h2 {
                color: #e74c3c;
                margin: 0;
                padding: 10px; /* Adjust padding to ensure alignment */
            }
            p {
                margin: 0;
                padding: 10px; /* Adjust padding to ensure alignment */
            }
            .highlight {
                border-left: 5px solid #3498db;
                padding: 10px;
                margin: 0; /* Remove margin */
            }
            .intro, .conclusion {
                border-left: 5px solid #1abc9c;
                padding: 10px;
                margin: 0; /* Remove margin */
            }
        </style>
    </head>
    <body>
        <h2>Garage Manager Code Analysis</h2>
        <div class="intro">
            <p>Below is a detailed analysis of your Garage Manager project, focusing on design patterns, OOP principles, and highlighting well-designed parts of your code.</p>
        </div>
        
        <div class="highlight">
            <h3>1. Overall Structure</h3>
            <p>Your project is well-organized into different folders and files, separating the console UI from the logic layer. This separation of concerns is a good practice as it makes the code more maintainable and scalable.</p>
        </div>
        
        <div class="highlight">
            <h3>2. Object-Oriented Principles</h3>
            <p>Let's analyze how well your code adheres to OOP principles:</p>
            <ul>
                <li><strong>Encapsulation:</strong> Most of your classes have internal accessibility, which is good for encapsulating the logic within the assembly. However, consider making some classes or methods private if they are not intended to be accessed outside their class.</li>
                <li><strong>Inheritance:</strong> You have a clear inheritance hierarchy, such as <code>Car</code>, <code>MotorBike</code>, and <code>Track</code> inheriting from <code>Vehicle</code>. This promotes code reuse and polymorphism.</li>
                <li><strong>Polymorphism:</strong> Ensure that you are leveraging polymorphism effectively by using base class references to interact with derived class objects.</li>
                <li><strong>Abstraction:</strong> Your use of abstract classes like <code>Vehicle</code> and <code>MotorType</code> is effective in providing a common interface for derived classes.</li>
            </ul>
        </div>
        
        <div class="highlight">
            <h3>3. Design Patterns</h3>
            <p>Here are some design patterns that could be beneficial for your project:</p>
            <ul>
                <li><strong>Factory Pattern:</strong> The <code>CreatingObject</code> class is a good candidate for the Factory pattern. It can be used to create instances of different vehicle types without exposing the instantiation logic to the client.</li>
                <li><strong>Singleton Pattern:</strong> If <code>GarageManager</code> is intended to be a single instance throughout the application, consider implementing the Singleton pattern to ensure only one instance is created.</li>
                <li><strong>Strategy Pattern:</strong> If you have different algorithms for managing vehicles, you can encapsulate them in separate classes and use the Strategy pattern to switch between them dynamically.</li>
            </ul>
        </div>
        
        <div class="highlight">
            <h3>4. Exception Handling</h3>
            <p>Your custom exceptions like <code>CarExistException</code> and <code>fillEnergyToMaxException</code> are well-designed. They provide specific error handling and make the code more readable and maintainable.</p>
        </div>
        
        <div class="highlight">
            <h3>5. Well-Designed Parts</h3>
            <p>Here are some well-designed parts of your code:</p>
            <ul>
                <li><strong>Separation of Concerns:</strong> The separation between the UI layer and the logic layer is well-maintained, making the code more modular and easier to manage.</li>
                <li><strong>Use of Collections:</strong> The use of collections like <code>List</code> and <code>Dictionary</code> in <code>GarageManager</code> is effective for managing client and vehicle data.</li>
                <li><strong>Custom Exceptions:</strong> Your custom exceptions provide clear and specific error messages, which is a good practice for debugging and maintenance.</li>
            </ul>
        </div>
        
        <div class="highlight">
            <h3>6. Areas for Improvement</h3>
            <p>Here are some areas where you can improve your code:</p>
            <ul>
                <li><strong>Accessibility Modifiers:</strong> Review the accessibility modifiers of your classes and methods. Make them as restrictive as possible to enhance encapsulation.</li>
                <li><strong>Design Patterns:</strong> Implement the suggested design patterns to make your code more flexible and maintainable.</li>
                <li><strong>Code Duplication:</strong> Look for any code duplication and refactor it into reusable methods or classes.</li>
            </ul>
        </div>
    </body>
    </html>`
  },
  {
    "role": "user",
    "content": `please not include summary like this:"This version adheres to your specified style and removes the summary at the end. Let me know if there's anything else you'd like to adjust!"
    analyze this code:
    ${UserProjectStructure}`
  }
];

module.exports = InitAIConversation;

