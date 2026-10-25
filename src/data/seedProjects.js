// Seed Projects Data for GG TECHCORE
// 6 Default Reference Engineering Projects across core engineering domains

export const initialProjects = [
  {
    id: "proj_esp32_smart_iv",
    title: "Smart Hospital Infusion & IV Monitoring System",
    category: "Embedded systems and ESP32",
    shortDescription: "Automated IV drip monitoring system using precision load-cell telemetry, non-contact optical drop counting, and ESP32 Wi-Fi telemetry for healthcare facilities.",
    abstract: "A continuous intravenous infusion telemetry node designed to eliminate manual drip monitoring errors in hospital ICU and general wards. Incorporates an ultra-low drift strain-gauge load cell and an infrared optical drop sensor to detect flow rate deviations, blockages, empty fluid bags, and air-in-line bubbles. Features local audio-visual alerts and real-time MQTT streaming to central nursing station telemetry consoles with sub-2% flow measurement accuracy.",
    overview: "Engineered for rapid retrofit onto standard hospital IV infusion stands. The hardware features a dual-core ESP32 microcontroller with FreeRTOS managing parallel telemetry pipelines, dual load-cell amplification via 24-bit HX711 ADC, and an optical beam sensor. Powered by an internal Li-ion battery pack with medical-grade galvanic isolation and IP54 anti-microbial wipe-down enclosure.",
    problemStatement: "Over 30% of inpatient intravenous therapy complications arise from unmonitored flow rate drift, dry line occlusion, or delayed bag replacement, leading to venous collapse or accidental air embolism.",
    proposedSolution: "Deploy an intelligent edge-sensing node combining gravimetric (load cell) and optical drop-counting methods, transmitting live flow status to nursing station dashboards via Wi-Fi and Bluetooth Low Energy.",
    objectives: [
      "Achieve ±1.5% volumetric flow rate measurement precision across 10 - 250 mL/hr.",
      "Provide 18-hour continuous battery life on single charge with USB-C PD fast recharge.",
      "Support secure encrypted MQTT/TLS hospital intranet communication.",
      "Provide fail-safe physical alarms for occlusion, runaway flow, and bag empty states."
    ],
    hardwareRequirements: [
      "ESP32-WROOM-32D Dual-Core MCU (240MHz, 4MB Flash)",
      "1kg High-Precision Aluminum S-Type Strain Gauge Load Cell",
      "24-Bit HX711 Low-Noise ADC Differential Amplifier Module",
      "IR Transmissive Optical Sensor with Schmitt-Trigger Pulse Shaper",
      "3.7V 3200mAh Li-ion Battery with TP4056 USB-C Charge Controller",
      "0.96-inch OLED Display (128x64 I2C) for bed-side status monitoring",
      "Buzzer & RGB LED indicator array"
    ],
    softwareRequirements: [
      "ESP-IDF / FreeRTOS multi-threaded firmware architecture",
      "Kalman filtering algorithm for mechanical vibration & motion rejection",
      "MQTT client over TLS 1.3 with hospital server auto-reconnect",
      "Embedded Web server for zero-configuration Wi-Fi provisioning"
    ],
    circuitDiagramUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
    ],
    technologies: ["ESP32", "FreeRTOS", "HX711", "MQTT", "C++", "IoT Telemetry", "Li-ion BMS"],
    features: [
      "Dual Gravimetric & Optical Sensor Fusion",
      "Sub-2% Drip Flow Rate Precision",
      "Instant Occlusion & Air Bubble Alerting",
      "Central Telemetry Dashboard Integration"
    ],
    applications: [
      "Hospital Intensive Care Units (ICU)",
      "Chemotherapy Infusion Centers",
      "Pediatric Patient Care",
      "Veterinary Telemetry Clinics"
    ],
    advantages: [
      "Zero disposable modifications needed — clips directly to pole",
      "Rejects false positives caused by patient shifting or bed motion",
      "Continuous cloud and local display monitoring"
    ],
    limitations: [
      "Requires Wi-Fi coverage within hospital ward",
      "Must be recalibrated if load cell is dropped from >1 meter"
    ],
    published: true,
    createdAt: "2026-10-15T10:00:00.000Z",
    updatedAt: "2026-10-15T10:00:00.000Z"
  },
  {
    id: "proj_lidar_agv_rover",
    title: "Autonomous LiDAR AGV & Warehouse Rover",
    category: "Robotics",
    shortDescription: "Heavy-duty autonomous mobile robot with 360-degree 2D LiDAR SLAM, STM32 CAN-bus motor control, and ROS2 navigation stack for industrial logistics.",
    abstract: "A heavy-duty autonomous guided vehicle (AGV) engineered for indoor industrial logistics and warehouse payload transport. Combines a 360-degree 2D LiDAR sensor with wheel odometry and an onboard IMU via an Extended Kalman Filter (EKF). Driven by dual 24V 250W brushless DC planetary gearmotors managed by an STM32 ARM Cortex-M4 CAN-bus motor driver and an NVIDIA Jetson single-board computer running ROS2 Humble.",
    overview: "Built on a 4-wheel differential-drive aluminum chassis capable of moving 50kg payloads at up to 1.5 m/s. Obstacle avoidance uses fused LiDAR laser scan data and 4 ultrasonic rangefinders. Integrates automated docking with wireless contact charging pads for 24/7 continuous warehouse operations.",
    problemStatement: "Manual pallet and component transport in distribution centers accounts for high labor costs and frequent workplace forklift accidents.",
    proposedSolution: "Deploy compact, intelligent autonomous rovers equipped with SLAM navigation that dynamically plan paths around workers and moving machinery without magnetic floor tapes.",
    objectives: [
      "Achieve sub-2cm positioning accuracy using LiDAR cartographer SLAM.",
      "Ensure 100% collision avoidance with dynamic objects moving up to 2.0 m/s.",
      "Support 50kg continuous payload transport with 6-hour runtime."
    ],
    hardwareRequirements: [
      "NVIDIA Jetson Orin Nano / Nano 4GB SBC",
      "STM32F407VET6 ARM Cortex-M4 Microcontroller Core",
      "RPLiDAR A2M8 360° 12m Laser Range Scanner",
      "Dual 24V 250W Brushless DC Planetary Geared Motors (150 RPM)",
      "Dual-Channel Closed-Loop FOC Motor Driver with CAN Bus",
      "24V 20Ah LiFePO4 High-Discharge Battery Pack",
      "4x HC-SR04 Ultrasonic Rangefinders + E-Stop Pushbutton"
    ],
    softwareRequirements: [
      "ROS2 Humble Hawksbill on Ubuntu 22.04 LTS",
      "Nav2 Navigation Stack with Costmap2D & DWB Local Planner",
      "Cartographer SLAM for 2D Occupancy Grid Generation",
      "STM32 C++ HAL firmware for closed-loop PID velocity control"
    ],
    circuitDiagramUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80"
    ],
    technologies: ["ROS2", "STM32", "LiDAR", "SLAM", "CAN Bus", "BLDC FOC", "Python"],
    features: [
      "Dynamic Obstacle Evasion with Costmap Layers",
      "Sub-2cm Waypoint Repeatability",
      "Automatic Docking & Wireless Pad Charging",
      "Industrial CAN-Bus Telemetry Interface"
    ],
    applications: [
      "E-Commerce Fulfillment Centers",
      "Automotive Assembly Lines",
      "Cleanroom Electronics Transport",
      "Hospital Linen & Pharmacy Delivery"
    ],
    advantages: [
      "Zero tape or infrastructure modification required on floors",
      "Failsafe hardware emergency stop and watchdog timers",
      "Fleet coordination via ROS2 DDS networking"
    ],
    limitations: [
      "Reflective glass partitions require supplemental ultrasonic range data",
      "Not rated for outdoor uneven terrain"
    ],
    published: true,
    createdAt: "2026-10-17T11:00:00.000Z",
    updatedAt: "2026-10-17T11:00:00.000Z"
  },
  {
    id: "proj_bldc_pcb_controller",
    title: "High-Density 4-Layer Motor Drive & BLDC Controller PCB",
    category: "PCB design and circuit development",
    shortDescription: "High-efficiency 48V 45A continuous Field-Oriented Control (FOC) 4-layer motor controller with integrated current shunt sensing and thermal vias.",
    abstract: "A custom 4-layer power electronics printed circuit board designed for ultra-compact brushless DC (BLDC) and Permanent Magnet Synchronous Motor (PMSM) control. Features an integrated DRV8305 gate driver, six low-RDS(on) N-channel power MOSFETs, three-phase current shunt amplifiers, and an STM32G4 mixed-signal microcontroller. Designed with 2oz copper inner layers, thermal via arrays under power silicon, and high-frequency ceramic decoupling.",
    overview: "Operates from 12V to 48V DC input with up to 45A continuous motor phase current and 90A burst current. Optimized in KiCad with rigorous signal integrity analysis, isolating 3.3V analog shunt measurements from high dV/dt MOSFET switching noise. Features hardware over-current comparator trip within 250ns and galvanic CAN transceiver interface.",
    problemStatement: "Commercial off-the-shelf motor ESCs often lack thermal margin, suffer from ringing EMI noise on phase wires, and lack flexible hardware current-loop telemetry for custom robotics.",
    proposedSolution: "Engineer a rugged, high-density 4-layer PCB with matched phase impedance, localized thermal dissipation planes, and built-in hardware protection circuits.",
    objectives: [
      "Sustain 45A continuous phase current without exceeding 75°C board temperature.",
      "Achieve >97.5% electrical inverter efficiency at nominal load.",
      "Maintain sub-50mV noise on 3-phase shunt feedback during full PWM switching."
    ],
    hardwareRequirements: [
      "STM32G431CBU6 Cortex-M4 MCU (170MHz, Math Accelerator)",
      "TI DRV8305 3-Phase Gate Driver with SPI diagnostics",
      "6x NTMFS5C604NL 60V 3.4mΩ N-Channel MOSFETs (5x6mm DFN)",
      "3x 1mΩ 3W 2512 Low-Inductance Manganin Current Shunts",
      "Isolated TJA1051 CAN FD Transceiver",
      "4-Layer 1.6mm FR4 Board with 2oz Copper & ENIG Finish"
    ],
    softwareRequirements: [
      "Field-Oriented Control (FOC) firmware with Space Vector PWM (SVPWM)",
      "Sensorless sliding-mode observer & absolute magnetic encoder feedback",
      "CANopen / CAN FD protocol stack for distributed robotics"
    ],
    circuitDiagramUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
    ],
    technologies: ["KiCad", "PCB Design", "BLDC FOC", "STM32", "Altium", "CAN FD", "Power Electronics"],
    features: [
      "48V / 45A Continuous Power Output",
      "250ns Fast Hardware Overcurrent Shutdown",
      "Isolated CAN-Bus Interface",
      "High-Thermal Dissipation 2oz Stackup"
    ],
    applications: [
      "Electric Mobility & E-Bikes",
      "High-Payload Drone Actuators",
      "Robotic Arm Exoskeletons",
      "Industrial CNC Spindle Control"
    ],
    advantages: [
      "Ultra-low thermal resistance to aluminum chassis heatsink",
      "Silent FOC vector control eliminates motor commutation hum",
      "Small 55mm x 55mm board footprint"
    ],
    limitations: [
      "Requires aluminum backplate heatsink for currents above 30A"
    ],
    published: true,
    createdAt: "2026-10-19T09:30:00.000Z",
    updatedAt: "2026-10-19T09:30:00.000Z"
  },
  {
    id: "proj_lorawan_env_node",
    title: "Industrial LoRaWAN Environmental Telemetry Node",
    category: "IoT and automation",
    shortDescription: "Ultra-low-power long-range IoT sensing station with micro-amp sleep mode, air quality gas analysis, and 15km line-of-sight wireless transmission.",
    abstract: "A ruggedized industrial IoT field telemetry node developed for remote infrastructure and agricultural environmental monitoring. Employs an STM32L4 ultra-low-power microcontroller paired with a Semtech SX1262 LoRa transceiver. Gathers multi-parameter sensor data including particulate matter (PM2.5/PM10), ambient temperature, relative humidity, barometric pressure, and volatile organic compounds (VOC). Operates for over 5 years on a single non-rechargeable LiSOCl2 battery cell.",
    overview: "Housed in an IP67 UV-stabilized polycarbonate enclosure with Gore-Tex vent. Firmware leverages FreeRTOS tickless idle modes to sleep at 2.4 µA average standby current. Supports LoRaWAN Class A specifications with adaptive data rating (ADR), OTAA join procedure, and AES-128 payload encryption directly into The Things Network (TTN) or AWS IoT Core.",
    problemStatement: "Monitoring remote solar farms, forest preserves, and industrial perimeters is impeded by lack of cellular signal and prohibitive wiring costs.",
    proposedSolution: "Deploy standalone, battery-powered LoRaWAN sensor nodes that transmit sensor telemetry up to 15km to an edge gateway without recurring cellular SIM subscriptions.",
    objectives: [
      "Achieve < 3 µA deep sleep quiescent current with periodic wake-up.",
      "Demonstrate 15km line-of-sight RF transmission range at SF12.",
      "Deliver IP67 weather resistance from -30°C to +70°C."
    ],
    hardwareRequirements: [
      "STM32L431RCT6 Ultra-Low-Power ARM Cortex-M4 MCU",
      "Semtech SX1262 868/915MHz LoRa Transceiver (+22dBm output)",
      "Sensirion SHT40 Temperature & Humidity Sensor",
      "Sensirion SGP40 Multi-Pixel Gas & VOC Sensor",
      "3.6V 19Ah SAFT LS33600 LiSOCl2 D-Cell Battery",
      "868MHz 3dBi Omni-Directional Collinear Antenna"
    ],
    softwareRequirements: [
      "LoRaWAN 1.0.4 Specification Stack (OTAA / ABP support)",
      "AES-128 Encryption & Dynamic Adaptive Data Rate (ADR)",
      "Embedded flash circular buffer for offline logging of 10,000 readings"
    ],
    circuitDiagramUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=1200&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
    ],
    technologies: ["LoRaWAN", "STM32", "SX1262", "Low Power", "IoT", "C++", "Sensirion"],
    features: [
      "15km Line-of-Sight Transmission Range",
      "5+ Year Battery Autonomy on Single D-Cell",
      "IP67 Waterproof Outdoor Enclosure",
      "Sub-3µA Standby Deep-Sleep Consumption"
    ],
    applications: [
      "Smart Agriculture & Crop Micro-Climate",
      "Industrial Factory Air Quality Compliance",
      "Forest Fire Early Warning Systems",
      "Solar Photovoltaic Station Monitoring"
    ],
    advantages: [
      "Zero wiring or infrastructure required",
      "Resistant to heavy industrial electromagnetic interference",
      "End-to-end encrypted packet transmission"
    ],
    limitations: [
      "Low data payload throughput (51 bytes per uplink payload)"
    ],
    published: true,
    createdAt: "2026-10-20T14:15:00.000Z",
    updatedAt: "2026-10-20T14:15:00.000Z"
  },
  {
    id: "proj_edge_ai_vision",
    title: "Edge AI Computer Vision Defect Inspection System",
    category: "AI-based engineering solutions",
    shortDescription: "High-speed industrial machine vision inspection station running TensorRT accelerated deep learning models for real-time assembly line quality control.",
    abstract: "An industrial edge-computing vision system designed for automated surface defect identification, solder bridge inspection, and component placement verification on electronics manufacturing lines. Powered by an NVIDIA Jetson Orin Nano edge computer running an optimized YOLOv8 neural network engine compiled via TensorRT. Inspects up to 60 parts per minute with 99.4% defect classification accuracy.",
    overview: "Integrates a 12-Megapixel global-shutter industrial camera with telecentric lens and programmable strobe ring illumination. Features an isolated optocoupler digital trigger for conveyor synchronization, high-speed pneumatic reject gate firing, and real-time dashboard telemetry streaming defect heatmaps to a local manufacturing execution system (MES).",
    problemStatement: "Manual quality inspection on PCB assembly lines leads to human fatigue, inconsistent flaw catching, and expensive warranty returns.",
    proposedSolution: "Deploy real-time edge AI computer vision directly above the conveyor belt to inspect 100% of manufactured units with millisecond latency.",
    objectives: [
      "Process 4K video frames in under 18ms inference latency.",
      "Attain >99.2% true positive flaw identification on 0402 SMD parts.",
      "Provide local REST and WebSocket API for factory line integration."
    ],
    hardwareRequirements: [
      "NVIDIA Jetson Orin Nano 8GB Edge AI Computer",
      "Basler 12MP Global Shutter USB3 Machine Vision Camera",
      "Opto-Engineering High-Resolution Telecentric Lens",
      "Industrial Strobe LED Ring Light with Constant Current Driver",
      "24V Isolated Optocoupler Digital I/O Expansion Module",
      "Solid Aluminum Vibration-Isolated Mounting Gantry"
    ],
    softwareRequirements: [
      "NVIDIA TensorRT 8.6 with FP16 Precision Optimization",
      "Custom-Trained YOLOv8 Object Detection & Segmentation Architecture",
      "Python OpenCV / C++ Inference Pipeline with Zero-Copy GPU Memory",
      "React-based Factory Inspection Web Dashboard"
    ],
    circuitDiagramUrl: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=1200&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
    ],
    technologies: ["TensorRT", "YOLOv8", "Python", "Jetson", "Computer Vision", "PyTorch", "OpenCV"],
    features: [
      "Sub-18ms Inference Latency per PCB Panel",
      "Sub-Millimeter Defect Identification",
      "Real-Time Strobe Illumination Triggering",
      "Factory MES Network Integration"
    ],
    applications: [
      "Surface Mount Technology (SMT) Lines",
      "Automotive Connector Quality Assurance",
      "Pharmaceutical Pill Blister Pack Verification",
      "Precision Machined Parts Metrology"
    ],
    advantages: [
      "Zero cloud latency — 100% offline edge processing",
      "Self-learning mode with active learning defect cataloging",
      "Directly triggers pneumatic ejection mechanisms"
    ],
    limitations: [
      "Requires controlled lighting environment without ambient solar flare"
    ],
    published: true,
    createdAt: "2026-10-21T16:00:00.000Z",
    updatedAt: "2026-10-21T16:00:00.000Z"
  },
  {
    id: "proj_solar_agritech_controller",
    title: "Solar-Powered Precision Agriculture Telemetry & Irrigation Controller",
    category: "Hardware and electronics",
    shortDescription: "Off-grid agricultural automation hub featuring multi-depth soil moisture profiling, solar MPPT battery management, and valve actuation.",
    abstract: "An intelligent solar-powered irrigation automation controller designed for off-grid precision farming. Features an integrated Maximum Power Point Tracking (MPPT) solar battery charger, multi-depth SDI-12 soil capacitive moisture sensor interfaces, and four 12V DC latching solenoid valve drivers. Dynamically regulates farm irrigation schedules based on real-time evapotranspiration modeling, saving up to 45% of water resources.",
    overview: "Equipped with an ESP32-S3 microcontroller with 4G LTE-M and Wi-Fi dual uplink modules. Employs pulse-width modulated H-bridge drivers to pulse latching valves with zero holding current, enabling total reliance on a compact 20W solar panel and internal LiFePO4 battery pack.",
    problemStatement: "Over-irrigation causes fertilizer leaching and root rot, while under-irrigation damages yield. Remote fields lack electrical grid power to operate conventional smart valves.",
    proposedSolution: "Deliver an all-weather off-grid controller combining solar MPPT charging with precision SDI-12 soil sensor probes and cellular cloud telemetry.",
    objectives: [
      "Deliver 100% autonomous off-grid operation across cloudy monsoon periods.",
      "Reduce agricultural irrigation water consumption by 35% to 45%.",
      "Support 4 independent zone valves with remote override from web portal."
    ],
    hardwareRequirements: [
      "ESP32-S3-WROOM-1 8MB PSRAM Microcontroller",
      "Quectel BG95 LTE-M / NB-IoT / GPS Cellular Module",
      "Integrated Synchronous MPPT Solar Charger Circuit (18V-24V in)",
      "4x L9110S H-Bridge Drivers for Latching Solenoids",
      "SDI-12 Multi-Depth Soil Moisture & EC Probe Interface",
      "12.8V 6Ah LiFePO4 Battery with Comprehensive BMS",
      "IP66 Weatherproof Enclosure with Gland Connectors"
    ],
    softwareRequirements: [
      "ESP-IDF C++ Firmware with FreeRTOS Power Scheduler",
      "Penman-Monteith Evapotranspiration Calculation Engine",
      "MQTT Telemetry Protocol over Cellular LTE-M link",
      "Mobile-Responsive Farm Management Web Application"
    ],
    circuitDiagramUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
    ],
    technologies: ["ESP32-S3", "Solar MPPT", "LTE-M", "IoT", "SDI-12", "LiFePO4", "C++"],
    features: [
      "Autonomous MPPT Solar Battery Harvesting",
      "Latching Solenoid Actuation with Zero Idle Current",
      "Multi-Depth Soil Volumetric Moisture Profiling",
      "Cellular Cloud Telemetry with GPS Geofencing"
    ],
    applications: [
      "Precision Drip Irrigation for Vineyards",
      "Commercial Greenhouse Automation",
      "Cotton & Cash Crop Water Management",
      "Municipal Landscaping Conservation"
    ],
    advantages: [
      "Zero reliance on external AC power or wired communications",
      "Latching valves consume energy only during a 50ms state pulse",
      "Protects against pump cavitation and line pressure drops"
    ],
    limitations: [
      "Cellular SIM card required for remote cloud access"
    ],
    published: true,
    createdAt: "2026-10-22T08:00:00.000Z",
    updatedAt: "2026-10-22T08:00:00.000Z"
  }
];

export const projectCategories = [
  "All Projects",
  "Hardware and electronics",
  "Embedded systems and ESP32",
  "IoT and automation",
  "Robotics",
  "Software and web applications",
  "PCB design and circuit development",
  "AI-based engineering solutions"
];
