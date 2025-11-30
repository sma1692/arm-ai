import { chat, loadModel } from '@/mod/LlmMode';
import { ParsedOptions } from '@/types/types';
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
  useEffect(()=>{
    setLoading(true)
    async function load(){
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
    load()
  },[])

  function parsePrompts(logText: string): ParsedOptions {
  const lines = logText.split('\n');
  const result: ParsedOptions = {
    option1: { heading: '', prompt: '' },
    option2: { heading: '', prompt: '' },
    option3: { heading: '', prompt: '' }
  };

  let currentOption: 'option1' | 'option2' | 'option3' | null = null;

  for (const line of lines) {
    if (line.includes('Option 1:')) {
      currentOption = 'option1';
      const headingMatch = line.match(/Option 1:\s*(.+)/);
      if (headingMatch && headingMatch[1]) {
        result.option1.heading = headingMatch[1].trim();
      }
    } else if (line.includes('Option 2:')) {
      currentOption = 'option2';
      const headingMatch = line.match(/Option 2:\s*(.+)/);
      if (headingMatch && headingMatch[1]) {
        result.option2.heading = headingMatch[1].trim();
      }
    } else if (line.includes('Option 3:')) {
      currentOption = 'option3';
      const headingMatch = line.match(/Option 3:\s*(.+)/);
      if (headingMatch && headingMatch[1]) {
        result.option3.heading = headingMatch[1].trim();
      }
    }
    
 
    if (line.includes('Prompt:') && currentOption) {

      const promptMatch = line.match(/Prompt:\s*"(.+)"/);
      if (promptMatch && promptMatch[1]) {
        result[currentOption].prompt = promptMatch[1];
      }
    }
  }

  return result;
}

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
            let p = parsePrompts(res)
            console.log(p)
            setResponse(res);
            router.push({
                pathname: "/genAudio",
                params:{
                    originalPrompt: input,
                    h1:p.option1.heading.replaceAll("**",""),
                    h2:p.option2.heading.replaceAll("**",""),
                    h3:p.option3.heading.replaceAll("**",""),
                    option1: p.option1.prompt,
                    option2: p.option2.prompt,
                    option3:  p.option3.prompt,
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
        <Text style={styles.loadingText}>Loading model...</Text>
        <Text style={styles.subText}>This may take a minute</Text>
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
      <Text style={styles.subtitle}>✓ Model loaded successfully</Text>

      <View style={styles.section}>
        <Text style={styles.label}>What on you mind</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
          editable={!generating}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, generating && styles.buttonDisabled]}
        onPress={handleChatSubmit}
        disabled={generating || !input.trim()}>
        <Text style={styles.buttonText}>
            {generating ? 'Generating...' : 'Generate'}
        </Text>
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#020617",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#2dd4bf",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingText: {
    color: "#7dd3fc",
    marginTop: 10,
    fontSize: 16,
  },
  subText: {
    color: "#94a3b8",
    marginTop: 6,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 24,
    color: "#f43f5e",
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorText: {
    color: "#fda4af",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 18,
  },
  label: {
    color: "#7dd3fc",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  systemInput: {
    backgroundColor: "#1e293b",
    color: "#f1f5f9",
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#334155",
  },
  input: {
    backgroundColor: "#1e293b",
    color: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 110,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#0ea5e9",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 15,
  },
  buttonDisabled: {
    backgroundColor: "#475569",
  },
  buttonText: {
    color: "#020617",
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
    color: "#38bdf8",
    marginBottom: 10,
  },
  responseText: {
    color: "#f1f5f9",
    fontSize: 16,
    lineHeight: 24,
  },
});

export default ChatScreen;