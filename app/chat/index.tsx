import { chat, loadModel, parsePromptsV2 } from '@/mod/LlmMode';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const ChatScreen = () => {
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(``);
  const [loadingMessages, setLoadingMessages] = useState<string>('Loading your creative engine…');
  // useEffect(()=>{
  //   setLoading(true)
  //   async function load(){
  //       try{
  //           let m = await loadModel()
  //           setModel(m)
  //           setLoading(false)
  //       }catch(error){
  //           console.log(error)
  //           setLoading(false)
  //           setError("Unable to load model")
  //       }
  //   }
  //   load()
  // },[])
  useEffect(() => {
    setLoading(true);
    setError(null);
    setLoadingMessages('Loading your creative engine…');

    let timeouts: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    async function loadSequence() {
      try {
        // 1s delay → add "Spinning up the mood machine…" and start model load
        await new Promise<void>((resolve) => {
          const t = setTimeout(() => {
            if (cancelled) return;
            setLoadingMessages("Spinning up the mood machine…");
            resolve();
          }, 1000);
          timeouts.push(t);
        });

        const m = await loadModel();
        if (cancelled) return;

        setModel(m);

        // Add "Initializing AI models…"
        setLoadingMessages((prev) => 
          'Initializing AI models…');

        // 0.5s → "Launching.. "
        await new Promise<void>((resolve) => {
          const t = setTimeout(() => {
            if (cancelled) return;
            setLoadingMessages((prev) => 'Launching.. ');
            resolve();
          }, 500);
          timeouts.push(t);
        });

        // Another 0.5s → move to next activity (hide loader)
        const t = setTimeout(() => {
          if (cancelled) return;
          setLoading(false);
        }, 500);
        timeouts.push(t);
      } catch (err) {
        console.log(err);
        if (!cancelled) {
          setError('Unable to load model');
          setLoading(false);
        }
      }
    }

    loadSequence();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);


    async function handleChatSubmit() {
        // running?
        if (generating) return;

        if (!input.trim()) {
            setError('Input must be present');
            return;
        }

        if (!model) {
            setError('Model not initialized');
            return;
        }

        setError(null);
        setGenerating(true);
        setResponse('');

        try {
            console.log(input);
            
            const res = await chat(input, model);
            if (!res) {
            throw new Error('No Response');
            }
            console.log(res);
            let p = parsePromptsV2(res)
            console.log(p)
            setResponse(res);
            router.push({
                pathname: "/genAudio",
                params:{
                    originalPrompt: input,
                    h1:p[0]?.heading,
                    h2:p[1]?.heading,
                    h3:p[2]?.heading,
                    option1: p[0].prompt,
                    option2: p[1].prompt,
                    option3:  p[2].prompt,
                }
            })
        } catch (error) {
            console.log(error);
            setError('Chat Gone Wrong');
        } finally {
            setGenerating(false);
        }
    }


  async function handleRetry(){
     try{
        let m = await loadModel()
        setModel(m)
        setLoading(false)
    }catch(error){
        console.log(error)
        setLoading(false)
        setError("Unable to load model")
    }
  } 



   if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>
            {loadingMessages}
          </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>⚠️ Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Model loaded. Let’s turn words into music.</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Tell us what your post feels like</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Describe your reel, story, or vibe…"
          placeholderTextColor="#999"
          multiline
          editable={!generating}
        />
      </View>

      {!generating?<TouchableOpacity
        style={[styles.button, generating && styles.buttonDisabled]}
        onPress={handleChatSubmit}
        disabled={generating || !input.trim()}>
        <Text style={styles.buttonText}>
            {generating ? 'Generating...' : 'Echo the Mood'}
        </Text>
    </TouchableOpacity>:<></>}

    {generating && (
      <View style={styles.generatingContainer}>
        <ActivityIndicator size="small" color="#8b5cf6" />
        <Text style={styles.generatingText}>
          Hang tight — generating ideas…
        </Text>
      </View>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F2FF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F2FF",
    padding: 20,
  },
  generatingContainer: {
  marginTop: 14,
  alignItems: "center",
  },

  generatingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#1B2449",
    opacity: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B2449",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#1B2449",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingText: {
    color: "#1B2449",
    marginTop: 10,
    fontSize: 16,
  },
  subText: {
    color: "#1B2449",
    marginTop: 6,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 24,
    color: "#FF7B9C",
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorText: {
    color: "#1B2449",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF7B9C",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#1B2449",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 18,
  },
  label: {
    color: "#1B2449",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  systemInput: {
    backgroundColor: "#FFFFFF",
    color: "#1B2449",
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#FF7B9C",
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#1B2449",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 110,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#FF7B9C",
  },
  button: {
    backgroundColor: "#FF7B9C",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 15,
  },
  buttonDisabled: {
    backgroundColor: "#F2B8C6",
  },
  buttonText: {
    color: "#1B2449",
    fontSize: 16,
    fontWeight: "bold",
  },
  responseContainer: {
    marginTop: 20,
    flex: 1,
  },
  responseLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B2449",
    marginBottom: 10,
  },
  responseText: {
    color: "#1B2449",
    fontSize: 16,
    lineHeight: 24,
  },
});


export default ChatScreen;