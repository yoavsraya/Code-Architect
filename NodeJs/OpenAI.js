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
const filePath = '/home/ec2-user/Code-Analyzer/C#/Parser Output.txt';
const UserProjectStructure = fs.readFileSync(filePath, 'utf-8');

async function RunAI() {
    const completion = await openai.chat.completions.create({
      messages: [{"role": "user", "content": "you are a code designer"},

          {"role": "assistant", "content": "Absolutely! How can I assist you with your coding project today? Whether it's designing a new feature, optimizing existing code, debugging, or any other coding-related task, I'm here to help. Just provide me with some details about what you're working on."},

          {"role": "user", "content": `Analyze my code structure and provide feedback on its design, focusing on:

          Design Pattern Integration: Identify opportunities to leverage appropriate design patterns.
          
          OOP Principle Adherence: Evaluate adherence to OOP principles and suggest improvements.
          
          Well-Designed Code Recognition: Highlight well-designed code portions and explain their effectiveness.
          
          High-Level Design Recommendations: Provide high-level design recommendations for improvement.
          
          Example:
          
          Explain why a particular class should inherit from another or utilize a specific design pattern.
          
          Key Points:
          
          Focus on design principles and patterns, not specific code.
          Provide concise and actionable feedback.
          Avoid excessive detail or code examples.
          
          ASSISTANT:
          Sure! Please share the code or describe the architecture and design of your application so I can analyze it and provide feedback based on the aspects you mentioned. Feel free to summarize the structure and key components if the code is too extensive to share in one go.
          `},

          {"role": "assistant", "content": "Sure! Please share the code or describe the architecture and design of your application so I can analyze it and provide feedback based on the aspects you mentioned. Feel free to summarize the structure and key components if the code is too extensive to share in one go."},

          {"role": "user", "content":
          `Project: Garage-Manager
          Class: Program
            Methods:
              private Main()
            References:
              string[]
          
          Class: TUI
            Composition (components):
              GarageManager
              CreatingObject
            Methods:
              public RunGarage()
              private getFullDetailsOnVehicle()
              private fillElectric()
              private fillGas()
              private fillAirToMax()
              private changeVehicleCondition()
              private getListOfVehiclesByFilter()
              private getUserChoiceFromMenu()
              private wellcoming()
              private putVehicleInGarage()
              private putDetailsOfVehicleAndClient()      
              private putFlatVehicleInGarage()
              private userInputForClientInfoRequirements()
              private userInputForVehicleRequirements()   
              private printListOfString()
          
          Class: Car
            Inherits from: Vehicle     
            Methods:
              public RequirementsList()
              public BuildVehicle()    
              public VehicleDetails()
              protected updateEnergyDetails()
          
          Class: CarExistException
            Inherits from: System.Exception
          
          Class: ClientInfo
            Composition (components):
              Vehicle
            Methods:
              private fromEnumToString()
              public GetVehiclePlateNumber()
              public FillWheelsAirToMax()
              public FillEnergyInVehicle()
              public GetInfo()
            References:
              MotorType.eEnergyType
          
          Class: CreatingObject
            Composition (components):
              Vehicle
            Methods:
              public CreateNewVehicle()
              public MyVehicleRequirements()
              public MyClientInfoRequirements()
              public CreateMyClientInfoCard()
              public IsGarageEmpty()
            References:
              GarageManager
          
          Class: ElectricMotor
            Inherits from: MotorType
            Methods:
              public ReFill()
              public ToString()
            References:
              eEnergyType
          
          Class: fillEnergyToMaxException
            Inherits from: System.Exception
          
          Class: GarageManager
            Methods:
              public isVehicleExist()
              private FindClientByPlateNumber()
              public ReturnListOfPlatesByFilter()
              public UpdateClientStatus()
              private updateListOfClients()
              public FillWheelsToMax()
              public FillEnergyInVehicle()
              public getVehicleInfo()
              public getVehicleRequirement()
              public getClientRequirement()
              public detailsToAddClient()
              public GetGasTypeList()
              public GetVehicleOptions()
              public isGasType()
            References:
              ClientInfo
              Vehicle
          
          Class: GasMotor
            Inherits from: MotorType
            Methods:
              public ReFill()
              public ToString()
            References:
              eEnergyType
          
          Class: MotorBike
            Inherits from: Vehicle
            Methods:
              public RequirementsList()
              public BuildVehicle()
              public VehicleDetails()
              protected updateEnergyDetails()
          
          Class: MotorType
            Methods:
              public ReFill()
              public calculateMeterPercent()
          
          Class: Track
            Inherits from: Vehicle
            Methods:
              public RequirementsList()
              public BuildVehicle()
              public VehicleDetails()
              protected updateEnergyDetails()
          
          Class: ValueOutOfRangeException
            Inherits from: System.Exception
          
          Class: Vehicle
            Composition (components):
              MotorType
              Wheels
            Methods:
              public ReFillVehicle()
              public FillWheelsAirToMax()
              public FillWheelsAir()
              public RequirementsList()
              public BuildVehicle()
              protected CreateEngine()
              public VehicleDetails()
              protected updateEnergyDetails()
            References:
              MotorType.eEnergyType
          
          Class: Wheels
            Methods:
              internal FillAirWheel()
              internal UpdateWheelDetails()`},

          {"role": "assistant", "content": `Thanks for providing the structure of your application, which appears to be a garage management system. I'll analyze this structure based on the points you mentioned:

          ### Design Pattern Integration:
          
          1. **Singleton Pattern**:
             - If there is only one 'GarageManager' instance intended throughout the application, consider implementing it as a Singleton.
             - This pattern can ensure that there is only one instance managing the garage and provide a global point of access.
          
          2. **Factory Pattern**:
             - The 'CreatingObject' class already seems to have a factory-like role with methods like 'CreateNewVehicle()'.
             - Expanding on this, you could formalize it into a Factory Pattern, ensuring that the creation logic for different vehicles ('Car', 'MotorBike', 'Track', etc.) is well encapsulated.
          
          3. **Strategy Pattern**:
             - For handling different filling mechanisms ('fillElectric()', 'fillGas()', 'FillAirToMax()'), consider using the Strategy Pattern.
             - This will decouple these filling operations from the context class ('TUI') and enable easier extension/maintenance.
          
          ### OOP Principle Adherence:
          
          1. **Encapsulation**:
             - Most of the data properties and methods are encapsulated in their respective classes, which is good practice.
             - Ensure that all private methods are genuinely hidden and accessed through public interfaces if needed.
          
          2. **Inheritance**:
             - Use of inheritance (e.g., 'Car', 'MotorBike', 'Track', 'Vehicle') is appropriate, promoting reuse and specialization.
             - Make sure the parent class ('Vehicle') contains only those attributes and methods that are common across all vehicles.
          
          3. **Single Responsibility Principle (SRP)**:
             - The 'TUI' class seems to have multiple responsibilities related to user interaction and some garage logic. It could be split into more focused classes or components.
          
          4. **Open/Closed Principle (OCP)**:
             - Classes like 'Vehicle', 'MotorType' should be open for extension but closed for modification, ensuring future enhancements can be added without changing existing code.
          
          ### Well-Designed Code Recognition:
          
          1. **Inheritance Structure**:
             - Classes like 'Car', 'MotorBike', 'Track' inheriting from 'Vehicle' are effective, promoting reuse and clear hierarchical relationships.
          
          2. **Exception Handling**:
             - Custom exceptions like 'CarExistException', 'ValueOutOfRangeException', 'fillEnergyToMaxException' are good practices to handle specific error cases, thereby improving error management and debugging.
          
          ### High-Level Design Recommendations:
          
          1. **Decouple TUI**:
             - Split the 'TUI' class into more components. For example, 'UserInputHandler', 'DisplayManager', and 'GarageController' could handle their respective responsibilities.
             - This makes the UI logic more manageable and testable.
          
          2. **Interface Segregation**:
             - Define interfaces for different responsibilities. For example, an 'IVehicle' interface could be created to specify the operations a vehicle must support, such as 'ReFillVehicle()', 'RequirementsList()', etc.
          
          3. **Facade Pattern**:
             - Consider implementing a Facade class that manages interactions between the 'TUI' and 'GarageManager', simplifying the interface for complex subsystems.
          
          ### Example Justifications:
          
          - **Singleton for GarageManager:**
            Since managing a garage is a core part of your application and there might be a need to maintain a single state of vehicles and clients, a Singleton ensures you only have one instance managing this state.
          
          - **Factory Pattern for Creating Vehicles:**
            By creating a 'VehicleFactory' that generates 'Car', 'MotorBike', and 'Track' objects, you can centralize and manage the creation logic. This adheres to the OCP, allowing easy addition of new vehicle types without modifying existing creation logic directly.
          
          ### Key Points Summary:
          
          - **Singleton Pattern** can ensure a single instance for core managers like 'GarageManager'.
          - **Factory Pattern** simplifies and centralizes object creation logic in 'CreatingObject'.
          - **Strategy Pattern** can decouple various vehicle-filling strategies.
          - Ensure **encapsulation** and responsibilities are properly managed.
          - **Inheritance** is well-utilized but can benefit from interface use for more abstraction.
          - **Decoupling TUI Code** into more manageable classes will improve maintainability.
          
          By applying these recommendations, you can enhance the design, maintainability, and extendibility of your garage management system.`},
         
          {"role": "user", "content": "thanks! ready for more code?"},

          {"role": "assistant", "content": "Absolutely! Please share the next portion of your code or provide details about its structure, and I'll continue with the analysis and feedback."},
        
          {role: "user", content: UserProjectStructure}],
      model: "gpt-4o",
    });
  
    return (completion.choices[0]);
  }
  
  module.exports = {
    RunAI,
  };