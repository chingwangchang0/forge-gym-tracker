// Cloud sync is optional. The existing tracker continues working offline.
const $ = id => document.getElementById(id);
const status = message => { $('cloudStatus').textContent = message; };
const configKey = 'forge_cloud_config_v1';
let client, user, ready = false, busy = false, timer;
let config = JSON.parse(localStorage.getItem(configKey) || '{}');
$('cloudUrl').value = config.url || '';
$('cloudKey').value = config.key || '';
const snapshot = () => JSON.parse(localStorage.getItem('forge_v2') || '{"sessions":[],"measurements":[],"drafts":{}}');
const valid = d => d && Array.isArray(d.sessions) && Array.isArray(d.measurements) && d.drafts && typeof d.drafts === 'object';
async function connect() {
  ready = false; user = null;
  if (!config.url || !config.key) { status('Cloud not configured. Your data remains local.'); return; }
  try {
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config.url)) throw Error('Enter your HTTPS Supabase project URL.');
    const {createClient} = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client = createClient(config.url.replace(/\/$/, ''), config.key, {auth:{persistSession:true,autoRefreshToken:true}});
    const {data:{user:current},error} = await client.auth.getUser();
    if (error && error.name !== 'AuthSessionMissingError') throw error;
    user = current;
    status(user ? `Signed in as ${user.email}. Choose Upload or Download to start syncing.` : 'Connected. Sign in or create an account.');
    client.auth.onAuthStateChange((_event, session) => { user = session?.user || null; if (!user) {ready=false; status('Signed out. Local tracking still works.');} });
  } catch (e) { status('Connection failed: ' + e.message); }
}
$('cloudConfigure').onclick = async () => {
  config = {url:$('cloudUrl').value.trim(),key:$('cloudKey').value.trim()};
  localStorage.setItem(configKey, JSON.stringify(config));
  await connect();
};
$('cloudSignUp').onclick = async () => {
  if (!client) return status('Save cloud configuration first.');
  const email=$('cloudEmail').value.trim(), password=$('cloudPassword').value;
  if (!email || password.length < 6) return status('Enter an email and a password with at least 6 characters.');
  const {data,error}=await client.auth.signUp({email,password});
  if (error) return status('Sign-up failed: '+error.message);
  user=data.user;
  status(data.session ? 'Account created. Choose Upload or Download.' : 'Check your email for the verification link, then sign in.');
};
$('cloudSignIn').onclick = async () => {
  if (!client) return status('Save cloud configuration first.');
  const {data,error}=await client.auth.signInWithPassword({email:$('cloudEmail').value.trim(),password:$('cloudPassword').value});
  if (error) return status('Sign-in failed: '+error.message);
  user=data.user; ready=false;
  status(`Signed in as ${user.email}. Choose Upload or Download to initialize sync.`);
};
$('cloudSignOut').onclick = async () => {
  if (!client) return;
  const {error}=await client.auth.signOut();
  if (error) return status(error.message);
  ready=false;user=null;status('Signed out. Local tracking still works.');
};
async function upload() {
  if (!client || !user) return status('Sign in first.');
  if (busy) return;
  busy=true;
  try {
    const {error}=await client.from('gym_data').upsert({user_id:user.id,payload:snapshot(),updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if (error) throw error;
    ready=true;status(`Cloud saved at ${new Date().toLocaleTimeString()}. Automatic sync is on.`);
  } catch(e) {status('Cloud upload failed: '+e.message);} finally {busy=false;}
}
$('cloudUpload').onclick = async () => {
  if (!user) return status('Sign in first.');
  if (!confirm('Replace the cloud copy with this device’s workout data? Export a backup first if unsure.')) return;
  await upload();
};
$('cloudDownload').onclick = async () => {
  if (!client || !user) return status('Sign in first.');
  try {
    const {data:record,error}=await client.from('gym_data').select('payload').eq('user_id',user.id).maybeSingle();
    if (error) throw error;
    if (!record) return status('No cloud data yet. Use Upload this device’s data to start.');
    if (!valid(record.payload)) throw Error('Cloud data format is invalid.');
    if (!confirm('Replace this device’s local workout data with your cloud copy? Export a backup first if unsure.')) return;
    localStorage.setItem('forge_v2',JSON.stringify(record.payload));
    ready=true;status('Cloud data downloaded. Reloading tracker…');
    location.reload();
  } catch(e) {status('Cloud download failed: '+e.message);}
};
window.forgeCloud = {queueSave() { if (!ready || !user) return; clearTimeout(timer); timer=setTimeout(upload,1200); }};
connect();
