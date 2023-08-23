import fs from "fs"
import OpenAI from 'openai';
import { supabase } from "./supabase.js"
import { config } from "dotenv"
config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function createChunks(inputText, chunkSize){
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
            openai.embeddings.create(
                {
                    model: "text-embedding-ada-002",
                    input: inputText
                }
            ).then((res)=>{
                // console.log(res["data"])
                result = res["data"][0]["embedding"]
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

async function ReadDocumentContentToSupabaseDBTable(){
    try{
        fs.readFile("./documents/sample.txt", "utf-8", (err, data)=>{
            if (err){
                console.error(err)
                return
            }

            // Concatenate lines into a single paragraph
            const lines = data.split("/n")
            const concatentatedFileText = lines.join(" ").trim().replace(/\s+/g, " ")

            // create chunks of data
            const chunkSize = 500
            const chunks = createChunks(concatentatedFileText, chunkSize)

            // perform embedding on each chunk
            for (const chunk of chunks) {
                embedText(chunk).then(async (result)=>{

                    // save to supabase postgres database
                    const { data, error } = await supabase
                        .from("semantic_vector_search")
                        .insert({
                            content: chunk,
                            embedding: result
                        })
                })
            }
        })
    }
    catch (error){
        console.error(error)
    }
}

ReadDocumentContentToSupabaseDBTable()
