/**
 * Mock AI Service for testing without OpenAI credits
 * This returns fake prescriptions for development/testing
 * DO NOT USE IN PRODUCTION!
 */

class MockAIService {
  async generatePrescription(patientData, symptoms) {
    console.log('⚠️  Using MOCK AI Service - Not real AI!');
    console.log('Patient:', patientData);
    console.log('Symptoms:', symptoms);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate different prescriptions based on symptoms keywords
    const symptomsLower = symptoms.toLowerCase();
    
    let diagnosis = '';
    let medications = [];
    let advice = '';
    
    // Simple keyword-based prescription generation
    if (symptomsLower.includes('fever') || symptomsLower.includes('temperature')) {
      diagnosis = `Fever - Possible viral infection based on symptoms: ${symptoms.substring(0, 60)}`;
      medications = [
        { name: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours as needed", duration: "3-5 days" },
        { name: "Ibuprofen", dosage: "400mg", frequency: "Every 8 hours with food", duration: "3-5 days" }
      ];
      advice = "Rest, stay hydrated, monitor temperature. Seek immediate care if fever exceeds 103°F.";
    } else if (symptomsLower.includes('cough') || symptomsLower.includes('cold')) {
      diagnosis = `Upper Respiratory Tract Infection based on symptoms: ${symptoms.substring(0, 60)}`;
      medications = [
        { name: "Dextromethorphan", dosage: "10ml", frequency: "Every 6 hours", duration: "5-7 days" },
        { name: "Cetirizine", dosage: "10mg", frequency: "Once daily at bedtime", duration: "7 days" }
      ];
      advice = "Stay hydrated, use humidifier, avoid cold drinks. Rest your voice if throat is sore.";
    } else if (symptomsLower.includes('headache') || symptomsLower.includes('migraine')) {
      diagnosis = `Headache/Migraine based on symptoms: ${symptoms.substring(0, 60)}`;
      medications = [
        { name: "Ibuprofen", dosage: "400mg", frequency: "Every 8 hours with food", duration: "As needed" },
        { name: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours", duration: "As needed" }
      ];
      advice = "Rest in dark, quiet room. Stay hydrated. Avoid screen time. Apply cold compress to forehead.";
    } else if (symptomsLower.includes('stomach') || symptomsLower.includes('nausea') || symptomsLower.includes('vomit')) {
      diagnosis = `Gastric distress based on symptoms: ${symptoms.substring(0, 60)}`;
      medications = [
        { name: "Omeprazole", dosage: "20mg", frequency: "Once daily before breakfast", duration: "7 days" },
        { name: "Ondansetron", dosage: "4mg", frequency: "Every 8 hours as needed", duration: "3 days" }
      ];
      advice = "Eat bland foods (BRAT diet), avoid spicy/fatty foods. Stay hydrated with small sips of water.";
    } else if (symptomsLower.includes('pain') || symptomsLower.includes('ache')) {
      diagnosis = `Pain management for symptoms: ${symptoms.substring(0, 60)}`;
      medications = [
        { name: "Ibuprofen", dosage: "400mg", frequency: "Every 8 hours with food", duration: "5-7 days" },
        { name: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours", duration: "5-7 days" }
      ];
      advice = "Apply ice/heat as appropriate. Rest affected area. Avoid strenuous activity.";
    } else {
      // Default prescription for unrecognized symptoms
      diagnosis = `General symptoms requiring evaluation: ${symptoms.substring(0, 60)}`;
      medications = [
        { name: "Paracetamol", dosage: "500mg", frequency: "Three times daily", duration: "5-7 days" },
        { name: "Multivitamin", dosage: "1 tablet", frequency: "Once daily with food", duration: "30 days" }
      ];
      advice = "Monitor symptoms closely. Maintain good hygiene and adequate rest.";
    }
    
    // Return a mock prescription with symptom-specific content
    return {
      diagnosis: diagnosis,
      medications: medications,
      advice: `${advice} Get plenty of rest, stay hydrated (8-10 glasses of water daily). ⚠️ MOCK PRESCRIPTION - For testing only, not real medical advice!`,
      followUp: "Follow up in 1 week if symptoms persist or worsen. Seek immediate care if symptoms deteriorate."
    };
  }
}

module.exports = new MockAIService();
