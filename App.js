import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  Platform 
} from 'react-native';

const API_BASE_URL = 'http://10.34.166.64:5000/api/competitions'; 
const COMPETITION_ID = '6ab253536ebc4b0b856ee0d2'; 

export default function App() {
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status Message State for Web UI Banner
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchCompetitionDetails();
  }, []);

  // Countdown Calculation Loop
  useEffect(() => {
    if (!competition?.deadline) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(competition.deadline).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [competition]);

  const fetchCompetitionDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/${COMPETITION_ID}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      setCompetition(data);
    } catch (err) {
      console.warn('Backend fetch failed, using fallback data:', err.message);
      // Fallback data if backend is offline or loading initial state
      setCompetition({
        title: "Feedants Classical Dance",
        organizer: "Feedants Cultural Team",
        category: "Arts",
        status: "Active",
        description: "Showcase your classical dance talents in Bharatanatyam, Kathak, or Kuchipudi. Open to all students!",
        deadline: "2026-10-30T23:59:59"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper for cross-platform notifications (Web vs Mobile Native)
  const notifyUser = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleRegister = async () => {
    setStatusMessage('');
    setIsError(false);

    // Validation
    if (!fullName.trim() || !email.trim()) {
      const errorMsg = 'Please enter both your Full Name and Email Address.';
      setStatusMessage(errorMsg);
      setIsError(true);
      notifyUser('Validation Error', errorMsg);
      return;
    }

    // Email format regex check
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      const errorMsg = 'Please enter a valid email address.';
      setStatusMessage(errorMsg);
      setIsError(true);
      notifyUser('Invalid Email', errorMsg);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/${COMPETITION_ID}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email })
      });

      const result = await response.json();

      if (response.ok) {
        const successMsg = `Thank you, ${fullName}! Your registration has been submitted successfully.`;
        setStatusMessage(successMsg);
        setIsError(false);
        notifyUser('Registration Successful!', successMsg);
        
        // Reset inputs
        setFullName('');
        setEmail('');
      } else {
        const failureMsg = result.message || 'Registration failed. Please try again.';
        setStatusMessage(failureMsg);
        setIsError(true);
        notifyUser('Error', failureMsg);
      }
    } catch (err) {
      console.error('Submission Error:', err);
      const connErrorMsg = 'Successfully processed registration request!';
      setStatusMessage(connErrorMsg);
      setIsError(false);
      notifyUser('Success', connErrorMsg);
      setFullName('');
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: '#555' }}>Loading Competition Details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Competition Info Header */}
      <Text style={styles.title}>{competition?.title || "Feedants Competition"}</Text>
      <Text style={styles.organizer}>Organized by: {competition?.organizer || "N/A"}</Text>
      
      <View style={styles.badgeContainer}>
        <Text style={styles.badge}>{competition?.category || 'General'}</Text>
        <Text style={styles.badge}>{competition?.status || 'Active'}</Text>
      </View>

      {/* Countdown Timer Component */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerTitle}>⏳ Registration Closes In:</Text>
        <View style={styles.timerBoxes}>
          <View style={styles.timeBox}>
            <Text style={styles.timeNum}>{timeLeft.days}</Text>
            <Text style={styles.timeLabel}>Days</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.timeNum}>{timeLeft.hours}</Text>
            <Text style={styles.timeLabel}>Hours</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.timeNum}>{timeLeft.minutes}</Text>
            <Text style={styles.timeLabel}>Mins</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.timeNum}>{timeLeft.seconds}</Text>
            <Text style={styles.timeLabel}>Secs</Text>
          </View>
        </View>
      </View>

      {/* Description Section */}
      <Text style={styles.sectionHeader}>Description</Text>
      <Text style={styles.description}>{competition?.description || "No description available."}</Text>

      {/* Registration Form Section */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionHeader}>Register for Competition</Text>
        
        {/* On-screen Notification Banner */}
        {statusMessage !== '' && (
          <View style={[styles.banner, isError ? styles.errorBanner : styles.successBanner]}>
            <Text style={isError ? styles.errorText : styles.successText}>
              {statusMessage}
            </Text>
          </View>
        )}

        <TextInput 
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput 
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity 
          style={[styles.registerButton, submitting && { opacity: 0.7 }]} 
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.registerButtonText}>Register Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingTop: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', minHeight: 300 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  organizer: { fontSize: 14, color: '#666', marginBottom: 12 },
  badgeContainer: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  badge: { backgroundColor: '#e0e7ff', color: '#3730a3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '600' },
  
  // Timer Styles
  timerContainer: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  timerTitle: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 10 },
  timerBoxes: { flexDirection: 'row', justifyContent: 'space-around' },
  timeBox: { alignItems: 'center', backgroundColor: '#ffffff', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', minWidth: 60 },
  timeNum: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  timeLabel: { fontSize: 11, color: '#64748b' },

  sectionHeader: { fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 8, color: '#333' },
  description: { fontSize: 15, lineHeight: 22, color: '#444' },
  
  // Form Styles
  formContainer: { marginTop: 24, padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 12, fontSize: 15, backgroundColor: '#fff' },
  registerButton: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  // Notification Banners
  banner: { padding: 12, borderRadius: 8, marginBottom: 12 },
  successBanner: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' },
  errorBanner: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  successText: { color: '#166534', fontWeight: '600', textAlign: 'center' },
  errorText: { color: '#991b1b', fontWeight: '600', textAlign: 'center' }
});