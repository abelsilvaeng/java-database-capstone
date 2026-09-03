// Seeds the prescriptions collection in MongoDB.
//
//   mongosh "mongodb://root:<password>@localhost:27017/prescriptions?authSource=admin" \
//     prescriptions/load-prescriptions.js
//
// Or, from a shell with the JSON file at hand:
//   mongoimport --uri "mongodb://root:<password>@localhost:27017/prescriptions?authSource=admin" \
//     --collection prescriptions --jsonArray --file prescriptions/prescriptions.json

db = db.getSiblingDB("prescriptions");

db.prescriptions.drop();

db.prescriptions.insertMany([
  {
    patientName: "Maria Silva",
    appointmentId: NumberLong(1),
    medication: "Atenolol",
    dosage: "50mg",
    doctorNotes: "One tablet each morning. Return in 30 days for a blood pressure check.",
    refillCount: 2,
    pharmacy: { name: "Downtown Pharmacy", location: "742 Evergreen Ave" },
    tags: ["cardiology", "oral"]
  },
  {
    patientName: "Joao Pereira",
    appointmentId: NumberLong(2),
    medication: "Hydrocortisone cream",
    dosage: "1% cream",
    doctorNotes: "Apply a thin layer twice a day for 10 days. Stop if irritation appears.",
    refillCount: 0,
    tags: ["dermatology", "topical"]
  },
  {
    patientName: "Ana Costa",
    appointmentId: NumberLong(3),
    medication: "Amoxicillin",
    dosage: "250mg/5ml suspension",
    doctorNotes: "5ml every 8 hours for 7 days. Complete the full course.",
    refillCount: 0,
    pharmacy: { name: "Riverside Drugstore", location: "88 Maple Street" },
    tags: ["pediatrics", "antibiotic"]
  },
  {
    patientName: "Pedro Santos",
    appointmentId: NumberLong(4),
    medication: "Losartan",
    dosage: "50mg",
    doctorNotes: "One tablet daily. Bring the home blood pressure log to the next visit.",
    refillCount: 3,
    tags: ["cardiology", "oral"]
  },
  {
    patientName: "Luiza Fernandes",
    appointmentId: NumberLong(5),
    medication: "Sumatriptan",
    dosage: "50mg",
    doctorNotes: "Take at the onset of a migraine. No more than two doses in 24 hours.",
    refillCount: 1,
    tags: ["neurology", "as-needed"]
  },
  {
    patientName: "Rafael Lima",
    appointmentId: NumberLong(6),
    medication: "Ibuprofen",
    dosage: "600mg",
    doctorNotes: "One tablet every 8 hours with food, for up to 5 days.",
    refillCount: 0,
    tags: ["orthopedics", "anti-inflammatory"]
  }
]);

db.prescriptions.createIndex({ appointmentId: 1 }, { unique: true });

print("prescriptions seeded: " + db.prescriptions.countDocuments());
