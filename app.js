const SUPABASE_URL = "PASTE_YOUR_URL";
const SUPABASE_KEY = "PASTE_ANON_KEY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const out = document.getElementById("output");
const cmd = document.getElementById("cmd");

let room = null;
let mode = null;

print("GhostLink v1 initialized");
print("Commands: mode drop | mode pad | room X | drop MSG | read | pad MSG");

cmd.addEventListener("keydown", async e => {
  if (e.key === "Enter") {
    await handle(cmd.value.trim());
    cmd.value = "";
  }
});

async function handle(text) {
  print("> " + text);

  if (text.startsWith("mode")) {
    mode = text.split(" ")[1];
    return print("Mode set: " + mode);
  }

  if (text.startsWith("room")) {
    room = text.split(" ")[1];
    return print("Room joined: " + room);
  }

  if (text.startsWith("drop")) {
    const msg = text.replace("drop ","");
    await db.from("ghostlink").insert({
      room, mode:"drop", payload: msg
    });
    return print("Message dropped.");
  }

  if (text === "read") {
    const { data } = await db
      .from("ghostlink")
      .select("*")
      .eq("room", room)
      .eq("mode","drop")
      .order("created_at",{ascending:true})
      .limit(1);

    if (!data.length) return print("No messages.");

    print("Message: " + data[0].payload);
    await db.from("ghostlink").delete().eq("id", data[0].id);
    return;
  }

  if (text.startsWith("pad")) {
    const pad = text.replace("pad ","");
    await db.from("ghostlink").delete().eq("room",room).eq("mode","pad");
    await db.from("ghostlink").insert({
      room, mode:"pad", payload: pad
    });
    return print("Pad updated.");
  }

  if (text === "pad read") {
    const { data } = await db
      .from("ghostlink")
      .select("*")
      .eq("room", room)
      .eq("mode","pad")
      .limit(1);

    return print(data.length ? data[0].payload : "Empty pad.");
  }

  print("Unknown command.");
}

function print(t){
  out.innerText += t + "\n";
}
