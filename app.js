// 🔴 PASTE YOUR DETAILS
const SUPABASE_URL = "https://ndytdiuibiqwyuiocnpv.supabase.co";
const SUPABASE_KEY = "sb_publishable_QFrJII0VLYW3Nm0KSk10xw_TTL2PBoU";

// ✅ v1 client
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const out = document.getElementById("output");
const cmd = document.getElementById("cmd");

let room = null;
let mode = null;

print("GhostLink v1.1 ONLINE");
print("Commands:");
print("mode drop | room X | drop MSG | read");
print("------------------------------");

cmd.addEventListener("keydown", async e => {
  if (e.key === "Enter") {
    const value = cmd.value.trim();
    cmd.value = "";
    if (value) await handle(value);
  }
});

async function handle(text) {
  print("> " + text);

  if (text.startsWith("mode ")) {
    mode = text.split(" ")[1];
    return print("Mode set: " + mode);
  }

  if (text.startsWith("room ")) {
    room = text.split(" ")[1];
    return print("Room joined: " + room);
  }

  if (text.startsWith("drop ")) {
    if (!room) return print("Join room first.");
    const msg = text.replace("drop ","");

    const { error } = await db.from("ghostlink").insert({
      room: room,
      mode: "drop",
      payload: msg
    });

    if (error) return print("Error: " + error.message);
    return print("Message sent.");
  }

  if (text === "read") {
    if (!room) return print("Join room first.");

    const { data, error } = await db
      .from("ghostlink")
      .select("*")
      .eq("room", room)
      .eq("mode", "drop")
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) return print("Error: " + error.message);
    if (!data.length) return print("No messages.");

    print("Message: " + data[0].payload);
    await db.from("ghostlink").delete().eq("id", data[0].id);
    return;
  }

  print("Unknown command.");
}

function print(t) {
  out.innerText += t + "\n";
  out.scrollTop = out.scrollHeight;
}
