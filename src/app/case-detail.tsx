import {useLocalSearchParams,useRouter} from 'expo-router';
import {useEffect,useState} from 'react';
import {ActivityIndicator,Image,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {api,loadProfile} from '../lib/api';

function items(value:unknown):string[]{
 if(Array.isArray(value))return value.filter((x):x is string=>typeof x==='string');
 if(typeof value==='string'){try{return items(JSON.parse(value));}catch{return [];}}
 return [];
}
export default function CaseDetail(){
 const {id}=useLocalSearchParams<{id:string}>();const router=useRouter();
 const [c,setC]=useState<any>(null),[officer,setOfficer]=useState(false);
 const [disease,setDisease]=useState(''),[treatment,setTreatment]=useState(''),[instructions,setInstructions]=useState('');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [analyzing,setAnalyzing]=useState(false),[analysisError,setAnalysisError]=useState('');
 const [confirmDelete,setConfirmDelete]=useState(false);
 const removeFeedback=async()=>{
  if(busy)return;setBusy(true);setError('');
  try{
   await api(`/cases/${id}/review`,{method:'DELETE'});
   setC((record:any)=>({...record,status:'submitted',officer_id:null,officer_name:null,confirmed_disease:null,treatment:null,instructions:null}));
   setDisease(c.disease||'');setTreatment('');setInstructions('');setConfirmDelete(false);
  }catch(e:any){setError(e.message||'Unable to delete feedback.');}finally{setBusy(false);}
 };
 const [analysis,setAnalysis]=useState<{disease:string;symptoms:string[];recommendations:string[];model:string;analyzed_at:string}|null>(null);
 const reanalyze=async()=>{
  if(analyzing)return;setAnalyzing(true);setAnalysisError('');setAnalysis(null);
  try{setAnalysis(await api(`/cases/${id}/reanalyze`,{method:'POST'}));}
  catch(e:any){setAnalysisError(e.message||'Unable to analyze this photo. Please try again.');}
  finally{setAnalyzing(false);}
 };
 useEffect(()=>{let active=true;setLoading(true);setError('');setAnalysis(null);setAnalysisError('');
  Promise.all([api<any>(`/cases/${id}`),loadProfile()]).then(([record,p])=>{
   if(!active)return;if(!p){router.replace('/secure-auth');return;}
   setOfficer(p.role==='officer'||p.role==='admin');setC(record);
   setDisease(record.confirmed_disease||record.disease||'');setTreatment(record.treatment||'');setInstructions(record.instructions||'');
  }).catch((e:any)=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[id,router]);
 const valid=disease.trim().length>=2&&treatment.trim().length>=5&&instructions.trim().length>=5;
 const submit=async()=>{if(busy||!valid)return;setBusy(true);setError('');try{
  await api(`/cases/${id}/review`,{method:'PATCH',body:JSON.stringify({confirmedDisease:disease.trim(),treatment:treatment.trim(),instructions:instructions.trim()})});
  router.replace('/case-board');
 }catch(e:any){setError(e.message);}finally{setBusy(false);}};
 return <ScrollView style={s.root} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
  <TouchableOpacity onPress={()=>router.back()}><Text style={s.back}>‹ Back to cases</Text></TouchableOpacity>
  <Text style={s.title}>Expert case #{id}</Text>
  {loading?<ActivityIndicator color="#176B3A"/>:!c?<Text style={s.error}>Case could not be loaded. Go back and open it again.</Text>:<>
   <View style={s.card}>
    {c.image_data?<Image accessibilityLabel="Farmer submitted plant photo" source={{uri:c.image_data}} style={{width:'100%',height:260,borderRadius:11}} resizeMode="contain"/>:<Text style={s.value}>No photo attached.</Text>}
    <Text style={s.label}>CROP & AI SCREENING</Text><Text style={s.value}>{c.crop} · {c.disease}</Text>
    <Text style={s.label}>FARMER & LOCATION</Text><Text style={s.value}>{c.farmer_name} · {c.location}</Text>
    {!!c.office&&<Text style={s.value}>Office: {c.office}</Text>}
    <Text style={s.label}>NOTES</Text><Text style={s.value}>{c.notes||'No additional notes'}</Text>
    {items(c.symptoms).length>0&&<><Text style={s.label}>AI OBSERVED SYMPTOMS</Text>{items(c.symptoms).map((x,i)=><Text key={i} style={s.value}>• {x}</Text>)}</>}
    {items(c.recommendations).length>0&&<><Text style={s.label}>AI SUGGESTIONS TO CHECK</Text>{items(c.recommendations).map((x,i)=><Text key={i} style={s.value}>• {x}</Text>)}</>}
    <Text style={s.label}>STATUS</Text><Text style={s.value}>{c.status} · {c.urgency} urgency</Text>
    {!!c.officer_name&&<Text style={s.value}>Reviewed by {c.officer_name}</Text>}
   </View>
   {officer&&<>
    <TouchableOpacity accessibilityRole="button" disabled={analyzing||busy||!c.image_data} style={[s.btn,(analyzing||busy||!c.image_data)&&{opacity:.5}]} onPress={reanalyze}>
     {analyzing?<ActivityIndicator color="white"/>:<Text style={s.btnText}>Re-analyze photo with AI</Text>}
    </TouchableOpacity>
    {analyzing&&<Text accessibilityLiveRegion="polite" style={s.value}>Checking the saved photo. This may take up to 45 seconds.</Text>}
    {!!analysisError&&<Text accessibilityLiveRegion="polite" style={s.error}>{analysisError}</Text>}
    {analysis&&<View style={[s.card,{marginTop:16}]}>
     <Text style={s.label}>NEW AI ASSESSMENT</Text><Text style={s.value}>{analysis.disease}</Text>
     <Text style={s.label}>VISIBLE SYMPTOMS</Text>{analysis.symptoms.map((x,i)=><Text key={i} style={s.value}>• {x}</Text>)}
     <Text style={s.label}>SUGGESTED NEXT STEPS</Text>{analysis.recommendations.map((x,i)=><Text key={i} style={s.value}>• {x}</Text>)}
     <Text style={s.label}>{new Date(analysis.analyzed_at).toLocaleString()}</Text>
     <Text style={s.value}>AI screening may be incorrect. Check this assessment before writing your feedback. This result is shown for this session; the original scan and your feedback are unchanged.</Text>
    </View>}
   </>}
   {(officer||c.status==='reviewed')&&<>
    <Text style={s.section}>{officer?'Officer diagnosis & feedback':'Agricultural officer feedback'}</Text>
    <Text style={s.label}>Confirmed / suspected disease</Text><TextInput editable={officer&&!busy} maxLength={160} style={s.input} value={disease} onChangeText={setDisease}/>
    <Text style={s.label}>Recommended treatment</Text><TextInput editable={officer&&!busy} maxLength={4000} style={[s.input,s.multiline]} multiline value={treatment} onChangeText={setTreatment} placeholder="Safe, actionable treatment recommendation"/>
    <Text style={s.label}>Instructions for farmer</Text><TextInput editable={officer&&!busy} maxLength={4000} style={[s.input,s.multiline]} multiline value={instructions} onChangeText={setInstructions} placeholder="Application, prevention and follow-up instructions"/>
    {officer&&<TouchableOpacity disabled={busy||!valid} style={[s.btn,(busy||!valid)&&{opacity:.5}]} onPress={submit}>{busy?<ActivityIndicator color="white"/>:<Text style={s.btnText}>{c.status==='reviewed'?'Update expert feedback':'Submit expert feedback'}</Text>}</TouchableOpacity>}
    {officer&&c.status==='reviewed'&&<>
     {!confirmDelete?<TouchableOpacity accessibilityRole="button" disabled={busy} style={[s.btn,{backgroundColor:'#A72D2D'}]} onPress={()=>setConfirmDelete(true)}><Text style={s.btnText}>Delete expert feedback</Text></TouchableOpacity>:<View style={[s.card,{marginTop:16}]}>
      <Text style={s.value}>Delete this feedback? It will no longer be visible to the farmer. The case and photo will stay available for another review.</Text>
      <TouchableOpacity disabled={busy} style={[s.btn,{backgroundColor:'#A72D2D'},busy&&{opacity:.5}]} onPress={removeFeedback}>{busy?<ActivityIndicator color="white"/>:<Text style={s.btnText}>Confirm delete feedback</Text>}</TouchableOpacity>
      <TouchableOpacity disabled={busy} onPress={()=>setConfirmDelete(false)}><Text style={[s.back,{textAlign:'center',marginTop:16}]}>Cancel</Text></TouchableOpacity>
     </View>}
    </>}
   </>}
   {!officer&&c.status!=='reviewed'&&<Text style={s.wait}>Your case has been submitted. An agricultural officer has not yet provided feedback.</Text>}
  </>}
  {!!error&&<Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
 </ScrollView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#F7FAF7'},body:{padding:20,paddingBottom:50},back:{color:'#176B3A',marginTop:8,marginBottom:20,fontWeight:'700'},title:{fontSize:25,color:'#174B2E',fontWeight:'800',marginBottom:20},card:{backgroundColor:'white',borderRadius:16,borderWidth:1,borderColor:'#E0EBE2',padding:18},label:{color:'#6B8472',fontWeight:'800',fontSize:11,letterSpacing:.7,marginTop:15,marginBottom:7},value:{color:'#315A3E',fontSize:15},section:{color:'#174B2E',fontWeight:'800',fontSize:19,marginTop:25},input:{backgroundColor:'white',borderColor:'#D6E5D9',borderWidth:1,padding:12,borderRadius:11,minHeight:48,color:'#234F34'},multiline:{minHeight:100,textAlignVertical:'top'},btn:{marginTop:25,backgroundColor:'#176B3A',borderRadius:13,padding:16,alignItems:'center'},btnText:{color:'white',fontWeight:'800'},wait:{color:'#8A6425',backgroundColor:'#FFF5DE',borderRadius:12,padding:18,marginTop:25,lineHeight:21},error:{color:'#B32A2A',marginTop:17}});
