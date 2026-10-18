import {useLocalSearchParams,useRouter} from 'expo-router';
import {useEffect,useState} from 'react';
import {ActivityIndicator,Image,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {api,loadProfile} from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

function items(value:unknown):string[]{
 if(Array.isArray(value))return value.filter((x):x is string=>typeof x==='string');
 if(typeof value==='string'){try{return items(JSON.parse(value));}catch{return [];}}
 return [];
}
export default function CaseDetail(){
 const {id}=useLocalSearchParams<{id:string}>();const router=useRouter();
 const [c,setC]=useState<any>(null),[officer,setOfficer]=useState(false);
 const [disease,setDisease]=useState(''),[treatment,setTreatment]=useState(''),[instructions,setInstructions]=useState('');
 const [crop,setCrop]=useState('');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [analyzing,setAnalyzing]=useState(false),[analysisError,setAnalysisError]=useState('');
 const [confirmDelete,setConfirmDelete]=useState(false);
 const [draftKey,setDraftKey]=useState('');
 const [draftReady,setDraftReady]=useState(false);
 const [draftMessage,setDraftMessage]=useState('');
 const removeFeedback=async()=>{
  if(busy)return;setBusy(true);setError('');
  try{
   await api(`/cases/${id}/review`,{method:'DELETE'});
   if(draftKey)await AsyncStorage.removeItem(draftKey);
   setC((record:any)=>({...record,status:'submitted',officer_id:null,officer_name:null,confirmed_disease:null,treatment:null,instructions:null}));
   setDisease(c.disease||'');setTreatment('');setInstructions('');setConfirmDelete(false);
  }catch(e:any){setError(e.message||'Unable to delete feedback.');}finally{setBusy(false);}
 };
 type Assessment={crop?:string;disease:string;symptoms:string[];recommendations:string[];treatment?:string;instructions?:string;model:string;analyzed_at:string};
 const [analysis,setAnalysis]=useState<Assessment|null>(null);
 const applyNames=(result:Assessment)=>{
  const hasCrop=!!result.crop?.trim()&&!/^(unspecified|unknown|uncertain)$/i.test(result.crop.trim());
  const hasDisease=!!result.disease?.trim()&&!/^(unspecified|unknown|uncertain)$/i.test(result.disease.trim());
  if(hasCrop)setCrop(result.crop!.trim());
  if(hasDisease)setDisease(result.disease.trim());
  setDraftMessage(hasCrop&&hasDisease?'AI crop and suspected disease filled in. Check both names and submit your feedback to save.':hasCrop||hasDisease?'Available AI name filled in. The other name could not be identified; enter it manually after assessment.':'AI could not identify the crop or disease. Enter the names manually after assessment.');
 };
 const reanalyze=async()=>{
  if(analyzing)return;setAnalyzing(true);setAnalysisError('');setAnalysis(null);
  try{
   const result=await api<Assessment>(`/cases/${id}/reanalyze`,{method:'POST',body:JSON.stringify(crop.trim().length>=2?{crop:crop.trim()}:{})});
   setAnalysis(result);applyNames(result);
   if(result.treatment?.trim())setTreatment(result.treatment.trim());
   if(result.instructions?.trim())setInstructions(result.instructions.trim());
   setDraftMessage('');
  }
  catch(e:any){setAnalysisError(e.message||'Unable to analyze this photo. Please try again.');}
  finally{setAnalyzing(false);}
 };
 useEffect(()=>{let active=true;setLoading(true);setDraftReady(false);setDraftMessage('');setError('');setAnalysis(null);setAnalysisError('');
  Promise.all([api<any>(`/cases/${id}`),loadProfile()]).then(async([record,p])=>{
   if(!active)return;if(!p){router.replace('/secure-auth');return;}
   setOfficer(p.role==='officer'||p.role==='admin');setC(record);
   setDisease(record.confirmed_disease||record.disease||'');setTreatment(record.treatment||'');setInstructions(record.instructions||'');
   setCrop(record.crop==='Unspecified'?'':record.crop||'');
   if(!record.confirmed_disease && record.disease==='Uncertain')setDisease('');
   setAnalysis(record.assessment||null);
   const key=`cropcare_review_draft_${p.id}_${id}`;
   setDraftKey(key);
   if(p.role==='officer'||p.role==='admin'){
    try{
     const saved=await AsyncStorage.getItem(key);
     if(!active)return;
     if(saved){const draft=JSON.parse(saved);if(draft.base===JSON.stringify([record.confirmed_disease,record.treatment,record.instructions])){
      setDisease(draft.disease);setTreatment(draft.treatment);setInstructions(draft.instructions);setDraftMessage('Your unfinished feedback was restored. Submit it to share it with the farmer.');
      if(typeof draft.crop==='string')setCrop(draft.crop);
     }}
    }catch{if(active)setDraftMessage('Unable to restore the local draft. Saved feedback is shown.');}
   }
   if(record.assessment){
    const saved=record.assessment as Assessment;
    if(saved.treatment?.trim())setTreatment(current=>current.trim()?current:saved.treatment!.trim());
    if(saved.instructions?.trim())setInstructions(current=>current.trim()?current:saved.instructions!.trim());
    if(saved.crop&&!/^(unspecified|unknown|uncertain)$/i.test(saved.crop.trim()))setCrop(current=>!current.trim()||/^(unspecified|unknown|uncertain)$/i.test(current.trim())?saved.crop!:current);
    if(saved.disease&&!/^(unspecified|unknown|uncertain)$/i.test(saved.disease.trim()))setDisease(current=>!current.trim()||/^(unspecified|unknown|uncertain)$/i.test(current.trim())?saved.disease:current);
   }
   if(active)setDraftReady(true);
  }).catch((e:any)=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[id,router]);
 useEffect(()=>{
  if(!draftReady||!officer||!draftKey||!c)return;
  const draft={crop,disease,treatment,instructions,base:JSON.stringify([c.confirmed_disease,c.treatment,c.instructions])};
  AsyncStorage.setItem(draftKey,JSON.stringify(draft)).catch(()=>setDraftMessage('Draft could not be saved on this device. Submit your feedback to save it to your account.'));
 },[crop,disease,treatment,instructions,draftReady,officer,draftKey,c]);
 const valid=crop.trim().length>=2&&disease.trim().length>=2&&treatment.trim().length>=5&&instructions.trim().length>=5;
 const submit=async()=>{if(busy||!valid)return;setBusy(true);setError('');try{
  await api(`/cases/${id}/review`,{method:'PATCH',body:JSON.stringify({crop:crop.trim(),confirmedDisease:disease.trim(),treatment:treatment.trim(),instructions:instructions.trim()})});
  if(draftKey)await AsyncStorage.removeItem(draftKey).catch(()=>{});
  router.replace('/case-board');
 }catch(e:any){setError(e.message);}finally{setBusy(false);}};
 return <ScrollView style={s.root} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
  <TouchableOpacity onPress={()=>router.back()}><Text style={s.back}>‹ Back to cases</Text></TouchableOpacity>
  <Text style={s.title}>Expert case #{id}</Text>
  {loading?<ActivityIndicator color="#176B3A"/>:!c?<Text style={s.error}>Case could not be loaded. Go back and open it again.</Text>:<>
   <View style={s.card}>
    {c.image_data?<Image accessibilityLabel="Farmer submitted plant photo" source={{uri:c.image_data}} style={{width:'100%',height:260,borderRadius:11}} resizeMode="contain"/>:<Text style={s.value}>No photo attached.</Text>}
    <Text style={s.label}>CROP & AI SCREENING{analysis?' · LATEST ASSESSMENT':''}</Text><Text style={s.value}>{analysis?.crop||c.crop} · {analysis?.disease||c.disease}</Text>
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
     <Text style={s.label}>AI CROP IDENTIFICATION</Text><Text style={s.value}>{analysis.crop||'Unspecified'}</Text>
     <Text style={s.label}>NEW AI ASSESSMENT</Text><Text style={s.value}>{analysis.disease}</Text>
     <Text style={s.label}>VISIBLE SYMPTOMS</Text>{analysis.symptoms.map((x,i)=><Text key={i} style={s.value}>• {x}</Text>)}
     <Text style={s.label}>SUGGESTED NEXT STEPS</Text>{analysis.recommendations.map((x,i)=><Text key={i} style={s.value}>• {x}</Text>)}
     <Text style={s.label}>{new Date(analysis.analyzed_at).toLocaleString()}</Text>
     <Text style={s.value}>Saved AI assessment. It will be available when you reopen this case. AI screening may be incorrect; check it before writing your feedback.</Text>
    </View>}
   </>}
   {(officer||c.status==='reviewed')&&<>
    <Text style={s.section}>{officer?'Officer diagnosis & feedback':'Agricultural officer feedback'}</Text>
    <Text style={s.label}>Crop type</Text><TextInput editable={officer&&!busy} accessibilityLabel="Crop type" maxLength={70} style={s.input} value={crop} onChangeText={setCrop} placeholder="Enter crop, e.g. Tomato or Rice"/>
    {officer&&<Text style={s.value}>{draftMessage||'Feedback is kept as a draft on this device. Submit it to save it to your account and share it with the farmer.'}</Text>}
    <Text style={s.label}>Confirmed / suspected disease</Text><TextInput editable={officer&&!busy&&!analyzing} accessibilityLabel="Confirmed or suspected disease" placeholder="Enter the officer’s suspected disease" maxLength={160} style={s.input} value={disease} onChangeText={setDisease}/>
    {officer&&analysis&&!/^(unspecified|unknown|uncertain)$/i.test(analysis.disease.trim())&&<Text accessibilityLiveRegion="polite" style={[s.value,{marginTop:8,lineHeight:21}]}>{`AI suggestion: ${analysis.disease}. Check this before submitting your assessment.`}</Text>}
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
