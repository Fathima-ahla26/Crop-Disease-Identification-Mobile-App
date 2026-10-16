import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api, saveSession } from "../lib/api";

export default function SecureAuth() {
  const router = useRouter();

  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async () => {
    if (busy) return;

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password || (signup && !name.trim())) {
      setError("Please complete all required fields.");
      return;
    }

    if (signup && password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setBusy(true);

    try {
      if (signup) {
        // Register without automatically signing in
        await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            email: cleanEmail,
            password,
          }),
        });

        // Show login after successful registration
        setSignup(false);
        setPassword("");
        setEmail(cleanEmail);
        setSuccess("Account created successfully! Please sign in to continue.");
      } else {
        // Sign in using registered account
        const session = await api<{
          token: string;
          user: {
            id: number;
            name: string;
            email: string;
            role: "farmer" | "officer" | "researcher" | "admin";
          };
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        });

        await saveSession(session);

        if (session.user.role === "researcher") {
          router.replace("/researcher-dashboard");
        } else if (
          session.user.role === "officer" ||
          session.user.role === "admin"
        ) {
          router.replace("/officer-dashboard");
        } else {
          router.replace("/home");
        }
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    if (busy) return;
    setSignup(!signup);
    setError("");
    setSuccess("");
    setPassword("");
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.wrap}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.logoCircle}>
          <Text style={s.logo}>🌿</Text>
        </View>

        <Text style={s.title}>Welcome to CropCare</Text>
        <Text style={s.sub}>Healthy Crops • Brighter Harvests</Text>

        <View style={s.card}>
          <Text style={s.heading}>
            {signup ? "Create Farmer Account" : "Welcome Back!"}
          </Text>

          <Text style={s.description}>
            {signup
              ? "Create your account to start protecting your crops."
              : "Sign in to continue your plant health journey."}
          </Text>

          {!!success && (
            <View style={s.successBox}>
              <Text style={s.successText}>✓ {success}</Text>
            </View>
          )}

          {signup && (
            <>
              <Text style={s.label}>Full Name</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                autoCapitalize="words"
                editable={!busy}
              />
            </>
          )}

          <Text style={s.label}>Email Address</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 8 characters"
            secureTextEntry
            editable={!busy}
            onSubmitEditing={submit}
          />

          {!!error && <Text style={s.error}>{error}</Text>}

          <TouchableOpacity
            disabled={busy}
            style={[s.primary, busy && s.disabled]}
            onPress={submit}
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={s.primaryText}>
                {signup ? "Create Account →" : "Sign In →"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.switch}
            onPress={switchMode}
            disabled={busy}
          >
            <Text style={s.link}>
              {signup
                ? "Already have an account? Sign In"
                : "Don't have an account? Create Account"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={s.note}>🌱 Smart Plant Disease Identification</Text>
        <Text style={s.footer}>Powered by CropCare • SLIIT WE_178</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F3F8F3",
  },
  wrap: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#E0F2E4",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  logo: {
    fontSize: 42,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#14532D",
    textAlign: "center",
  },
  sub: {
    fontSize: 13,
    color: "#64756B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    borderColor: "#DDE9DF",
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#164E32",
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },
  heading: {
    fontSize: 21,
    fontWeight: "800",
    color: "#193F2D",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: "#718277",
    lineHeight: 19,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#405849",
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D8E6DC",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#193F2D",
    backgroundColor: "#FAFCFA",
    fontSize: 14,
  },
  primary: {
    marginTop: 24,
    height: 52,
    borderRadius: 13,
    backgroundColor: "#176B3A",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.65,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  switch: {
    marginTop: 20,
    alignItems: "center",
  },
  link: {
    color: "#176B3A",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
  error: {
    color: "#B42318",
    marginTop: 12,
    fontSize: 13,
  },
  successBox: {
    backgroundColor: "#E5F5E9",
    padding: 13,
    borderRadius: 12,
    marginVertical: 12,
  },
  successText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
  },
  note: {
    marginTop: 24,
    color: "#4D745A",
    fontSize: 12,
    textAlign: "center",
  },
  footer: {
    marginTop: 12,
    fontSize: 11,
    color: "#819388",
    textAlign: "center",
  },
});
