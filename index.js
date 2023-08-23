import fs from "fs"
import OpenAI from 'openai';
import { supabase } from "./supabase.js"
import { config } from "dotenv"
config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function createChunk(inputText, chunkSize){
    const chunks = []
    let i = 0
    while (i < inputText.length){
        chunks.push(inputText.slice(i, i + chunkSize))
        i += chunkSize
    }
    return chunks
}

function embedText(inputText){
    try {
        var result = ""
        return new Promise((resolve)=>{
            openai.createEmbedding(
                {
                    model: "text-embedding-ada-002",
                    input: inputText
                }
            ).then((res)=>{
                result = res.data["data"][0]["embedding"]
            })
            setTimeout(()=>{
                resolve(result)
            }, 2000)
        })
    }
    catch (error){
        console.error(error)
    }
}
