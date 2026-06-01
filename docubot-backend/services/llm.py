from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()  # loads variables from .env file

# Instantiate client conditionally to allow swagger/endpoints initialization even if key is missing initially
def get_groq_client():
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key or api_key == 'gsk_your_actual_key_here':
        # Return none or mock or raise descriptive error on actual usage
        return None
    return Groq(api_key=api_key)

def answer_question(context_chunks: list, question: str) -> dict:
    client = get_groq_client()
    if not client:
        return {
            'answer': 'Error: GROQ_API_KEY is not set or is invalid in the backend .env file. Please check your configuration.',
            'sources': []
        }

    # Join the chunks into one context string
    context = '\n\n---\n\n'.join(context_chunks)

    prompt = f'''You are a helpful document assistant.
Answer ONLY using the context below.
If the answer is not in the context, say: I couldn't find that in the document.
Always mention which section or details you found the answer in.

CONTEXT:
{context}

QUESTION: {question}

Answer:'''

    try:
        response = client.chat.completions.create(
            model='llama-3.3-70b-versatile',  # best free model on Groq
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.2,  # low = more factual, less creative
            max_tokens=1000
        )
        return {
            'answer': response.choices[0].message.content,
            'sources': context_chunks[:3]  # return top 3 chunks as citations
        }
    except Exception as e:
        return {
            'answer': f'Error calling Groq API: {str(e)}',
            'sources': []
        }
