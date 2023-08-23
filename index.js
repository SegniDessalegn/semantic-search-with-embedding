import fs from "fs";
import OpenAI from "openai";
import { supabase } from "./supabase.js";
import { config } from "dotenv";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createChunks(inputText, chunkSize) {
  const chunks = [];
  let i = 0;
  while (i < inputText.length) {
    chunks.push(inputText.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}

async function embedText(inputText) {
  try {
    var result = "";
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: inputText,
    });

    result = response["data"][0]["embedding"];

    return result;
  } catch (error) {
    console.error(error);
  }
}

async function ReadDocumentContentToSupabaseDBTable() {
  try {
    fs.readFile("./documents/sample.txt", "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      // Concatenate lines into a single paragraph
      const lines = data.split("/n");
      const concatentatedFileText = lines.join(" ").trim().replace(/\s+/g, " ");

      // create chunks of data
      const chunkSize = 500;
      const chunks = createChunks(concatentatedFileText, chunkSize);

      // perform embedding on each chunk
      for (const chunk of chunks) {
        embedText(chunk).then(async (result) => {
          // save to supabase postgres database
          const { data, error } = await supabase
            .from("semantic_vector_search")
            .insert({
              content: chunk,
              embedding: result,
            });
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
}

// ReadDocumentContentToSupabaseDBTable()

async function searchVectorInSupabase(embedding) {
  try {
    // construct the SQL query to search for the vector
    const response = await supabase.rpc("match_documents", {
      query_embedding: embedding, // Pass the embedding you want to compare
      match_threshold: 0.78, // Choose an appropriate threshold for your data
      match_count: 5, // Choose the number of matches
    });

    return response["data"]
  } catch (error) {
    console.error("Error executing search query:", error);
  }
}

function GetInputQueryAndSearchVectorDB() {
  try {
    var query = "Who is the CEO of Twitter";

    console.log("Question:", query)

    // Step 1: Embed the user query to convert to Vector
    embedText(query).then((embedding) => {
      // Step 2: Search the vector DB for the embeded vector query
    searchVectorInSupabase(embedding).then((response)=>{
        console.log(response)
    })
    });
  } catch (error) {
    console.error(error);
  }
}

GetInputQueryAndSearchVectorDB();
