const fs = require('fs');

const filePath = '/home/ec2-user/Code-Analyzer/C#/ProjectParse.txt';
const UserProjectStructure = fs.readFileSync(filePath, 'utf-8');

const InitAIConversation = [
  { "role": "system", "content": "code Architect" },
  {
    "role": "user",
    "content": "I'm going to give you high-level codes and you will analyze my code structure and provide feedback on its design, focusing only on opportunities to leverage well-suited design patterns and improve adherence to OOP principles, also look for circuit dependency. Additionally, dont highlight well-designed parts of my code. I don't want you to show me practical code examples. Be essential. Wait for my high-level code. split your answer to a few topics, each topic have a bullet"
  },
  {
    "role": "assistant",
    "content": "Sure, go ahead and provide your high-level code. I'll analyze the structure and provide feedback on design patterns and OOP principles."
  },
  {
    "role": "user",
    "content":
     `Project: Garage-Manager

    Folder: Ex03.ConsoleUI
    File: Program.cs
    Class: Program
      Accessibility: internal
      Belongs to: EXE

    Folder: Ex03.ConsoleUI
    File: TUI.cs
    Class: TUI
      Accessibility: public
      Belongs to: EXE
      Composition:
        GarageManager
        CreatingObject

    Folder: Ex03.GarageLogic
    File: Car.cs
    Class: Car
      Accessibility: internal
      Belongs to: DLL
      Inherits from: Vehicle
      Composition:
        eNumOfDoors
        eCarColor

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
      Composition:
        Vehicle
      Aggregations:
        eClientStatus

    Folder: Ex03.GarageLogic
    File: CreatingObject.cs
    Class: CreatingObject
      Accessibility: public
      Belongs to: DLL
      Composition:
        Vehicle

    Folder: Ex03.GarageLogic
    File: ElectricMotor.cs
    Class: ElectricMotor
      Accessibility: internal
      Belongs to: DLL
      Inherits from: MotorType

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
      Composition:
        eClientStatus

    Folder: Ex03.GarageLogic
    File: GasMotor.cs
    Class: GasMotor
      Accessibility: internal
      Belongs to: DLL
      Inherits from: MotorType

    Folder: Ex03.GarageLogic
    File: MotorBike.cs
    Class: MotorBike
      Accessibility: internal
      Belongs to: DLL
      Inherits from: Vehicle
      Composition:
        eLicenseType

    Folder: Ex03.GarageLogic
    File: MotorType.cs
    Class: MotorType
      Accessibility: public
      Belongs to: DLL
      Composition:
        eEnergyType

    Folder: Ex03.GarageLogic
    File: Track.cs
    Class: Track
      Accessibility: internal
      Belongs to: DLL
      Inherits from: Vehicle

    Folder: Ex03.GarageLogic
    File: ValueOutOfRangeException.cs
    Class: ValueOutOfRangeException
      Accessibility: public
      Belongs to: DLL
      Inherits from: Exception

    Folder: Ex03.GarageLogic
    File: vehicle.cs
    Class: vehicle
      Accessibility: public
      Belongs to: DLL
      Composition:
        MotorType
        Wheels
        Car

    Folder: Ex03.GarageLogic
    File: Wheels.cs
    Class: Wheels
      Accessibility: public
      Belongs to: DLL`
  },
  {
    "role": "assistant",
    "content": `
      ### Design Patterns

- **Factory Pattern**: The 'CreatingObject' class seems to be responsible for creating instances of 'vehicle'. This suggests a Factory Pattern, but it could be more explicit. Consider using a Factory Method or Abstract Factory to handle the creation of different types of vehicles ('Car', 'MotorBike', 'Track').

- **Strategy Pattern**: The 'MotorType' class and its subclasses ('ElectricMotor', 'GasMotor') could benefit from the Strategy Pattern. This would allow you to encapsulate the varying behaviors of different motor types and make the 'vehicle' class more flexible.

- **Singleton Pattern**: If 'GarageManager' is intended to manage a single instance of the garage, consider implementing it as a Singleton to ensure only one instance exists.

### OOP Principles

- **Encapsulation**: The accessibility of classes like 'Car', 'MotorBike', and 'Track' is internal. If these classes are only used within the 'GarageLogic' assembly, this is fine. However, ensure that their internal state is well-encapsulated and not exposed unnecessarily.

- **Inheritance vs. Composition**: The 'vehicle' class has a composition relationship with 'MotorType', 'Wheels', and 'Car'. This is good, but ensure that inheritance is used appropriately. For example, 'Car', 'MotorBike', and 'Track' inherit from 'vehicle', which is appropriate if they share common behavior and properties.

- **Exception Handling**: Custom exceptions like 'CarExistException' and 'ValueOutOfRangeException' are good practices. Ensure that these exceptions are used to handle specific error conditions and provide meaningful messages to the user.

### Code Structure

- **Separation of Concerns**: The 'TUI' class in the 'Ex03.ConsoleUI' folder seems to handle the user interface and interacts with 'GarageManager' and 'CreatingObject'. Ensure that the UI logic is separated from the business logic. The 'TUI' class should only handle user interactions and delegate business logic to the appropriate classes in 'GarageLogic'.

- **Class Accessibility**: The 'Program' class is marked as internal, which is fine if it is only used within the 'Ex03.ConsoleUI' assembly. However, consider making it public if it needs to be accessed from other assemblies.

### Maintainability

- **Naming Conventions**: Ensure that class names and file names follow consistent naming conventions. For example, 'fillEnergyToMaxException' should be 'FillEnergyToMaxException' to follow PascalCase convention.

- **Modularity**: The project is divided into 'ConsoleUI' and 'GarageLogic', which is good for modularity. Ensure that each module has a clear responsibility and that dependencies between modules are minimized.

### Extensibility

- **Adding New vehicle Types**: If you need to add new types of vehicles in the future, ensure that the current design allows for easy extension. The Factory Pattern and Strategy Pattern can help in making the system more extensible.

- **Energy Types**: The 'MotorType' class has a composition relationship with 'eEnergyType'. Ensure that adding new energy types (e.g., hybrid) is straightforward and does not require significant changes to existing code.`
  },
  {
    "role": "user",
    "content": `exactly with the same instructions, analyze this high-level code:
    ${UserProjectStructure}`
  }
];

module.exports = InitAIConversation;
