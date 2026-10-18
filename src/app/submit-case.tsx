import {useLocalSearchParams,useRouter} from 'expo-router';
import {useEffect,useState} from 'react';
import {ActivityIndicator,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View} from 'react-native';
import {api} from '../lib/api';

type Field='notes'|'location'|'office'|'urgency';
export default function SubmitCase(){
 const {diagnosisId,caseId}=useLocalSearchParams<{diagnosisId:string;caseId?:string}>();const router=useRouter();
 const [notes,setNotes]=useState(''),[location,setLocation]=useState(''),[office,setOffice]=useState('');
 const [urgency,setUrgency]=useState<'low'|'moderate'|'high'>('moderate');
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [touched,setTouched]=useState<Partial<Record<Field,boolean>>>({});
 const [loading,setLoading]=useState(!!caseId),[loaded,setLoaded]=useState(!caseId);
 useEffect(()=>{
  let active=true;
  if(!caseId){setLoaded(true);setLoading(false);return;}
  setLoading(true);setLoaded(false);
  api<any>(`/cases/${caseId}`).then(record=>{
   if(!active)return;
   setNotes(record.notes||'');setLocation(record.location||'');setOffice(record.office||'');setUrgency(record.urgency);setLoaded(true);
  }).catch((e:any)=>{if(active)setError(e.message||'Unable to load case.');}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[caseId]);
 const hasLetter=(value:string)=>/\p{L}/u.test(value);
 const errors:Record<Field,string>={
  notes:notes.trim().length>3000?'Use 3,000 characters or fewer.':notes.trim()&&!hasLetter(notes)?'Describe the symptoms using words.':'',
  location:!location.trim()?'Enter your village or location.':location.trim().length<2?'Enter at least 2 characters.':location.trim().length>190?'Use 190 characters or fewer.':!hasLetter(location)?'Include a village or location name.':'',
  office:office.trim().length>190?'Use 190 characters or fewer.':office.trim()&&(office.trim().length<2||!hasLetter(office))?'Enter an office name with at least 2 characters.':'',
  urgency:['low','moderate','high'].includes(urgency)?'':'Select a case urgency.',
 };
 const touch=(field:Field)=>setTouched(current=>({...current,[field]:true}));
 const message=(field:Field)=>touched[field]&&!!errors[field]&&<Text accessibilityLiveRegion="polite" style={s.error}>{errors[field]}</Text>;
 const submit=async()=>{
  if(busy||loading||!loaded)return;setTouched({notes:true,location:true,office:true,urgency:true});setError('');
  if(Object.values(errors).some(Boolean))return;
  const parsedId=Number(diagnosisId);
  if(!caseId&&(!Number.isSafeInteger(parsedId)||parsedId<=0)){setError('Open a saved analysis before requesting an expert review.');return;}
  setBusy(true);
  try{await api(caseId?`/cases/${caseId}`:'/cases',{method:caseId?'PATCH':'POST',body:JSON.stringify({...(caseId?{}:{diagnosisId:parsedId}),notes:notes.trim(),location:location.trim(),office:office.trim(),urgency})});router.replace('/case-board');}
  catch(e:any){setError(e.message||'Unable to send your case. Please try again.');}finally{setBusy(false);}
 };
 return <ScrollView style={s.root} contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
  <Text style={s.title}>{caseId?'Edit expert case':'Request expert review'}</Text><Text style={s.subtitle}>{caseId?'Updating this case sends the changed details for a fresh officer review.':'Your saved analysis and details will be shared with an agricultural officer.'}</Text>
  {loading&&<ActivityIndicator color="#176B3A"/>}
  <Text style={s.label}>Additional symptoms (optional)</Text>
  <TextInput accessibilityLabel="Additional symptoms (optional)" editable={!busy} multiline maxLength={3000} onBlur={()=>touch('notes')} style={[s.input,s.multiline,touched.notes&&!!errors.notes&&s.invalid]} value={notes} onChangeText={setNotes} placeholder="Explain changes you observed..."/>{message('notes')}
  <Text style={s.label}>Village / Location *</Text>
  <TextInput accessibilityLabel="Village or location (required)" editable={!busy} maxLength={190} onBlur={()=>touch('location')} style={[s.input,touched.location&&!!errors.location&&s.invalid]} value={location} onChangeText={setLocation} placeholder="Eg: Anuradhapura"/>{message('location')}
  <Text style={s.label}>Agricultural office (optional)</Text>
  <TextInput accessibilityLabel="Agricultural office (optional)" editable={!busy} maxLength={190} onBlur={()=>touch('office')} style={[s.input,touched.office&&!!errors.office&&s.invalid]} value={office} onChangeText={setOffice} placeholder="Nearest office"/>{message('office')}
  <Text style={s.label}>Case urgency</Text>
  <View style={s.row}>{(['low','moderate','high'] as const).map(x=><TouchableOpacity key={x} accessibilityRole="radio" accessibilityState={{checked:urgency===x,disabled:busy}} disabled={busy} onPress={()=>{setUrgency(x);touch('urgency');}} style={[s.choice,urgency===x&&s.selected]}><Text style={[s.choiceText,urgency===x&&{color:'#176B3A'}]}>{x}</Text></TouchableOpacity>)}</View>{message('urgency')}
  {!!error&&<Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
  <TouchableOpacity accessibilityRole="button" onPress={submit} disabled={busy||loading||!loaded} style={[s.button,(busy||loading||!loaded)&&{opacity:.45}]}>{busy?<ActivityIndicator color="white"/>:<Text style={s.buttonText}>{caseId?'Update case':'Send case to expert →'}</Text>}</TouchableOpacity>
  <TouchableOpacity disabled={busy} onPress={()=>router.back()}><Text style={s.cancel}>Cancel</Text></TouchableOpacity>
 </ScrollView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#F7FAF7'},wrap:{padding:23},title:{color:'#155A34',fontWeight:'800',fontSize:25,marginTop:25},subtitle:{color:'#6C7C70',lineHeight:22,marginTop:9,marginBottom:20},label:{fontSize:13,fontWeight:'800',color:'#365443',marginTop:17,marginBottom:8},input:{borderColor:'#D4E2D7',borderWidth:1,backgroundColor:'white',height:50,padding:13,borderRadius:12},multiline:{height:105,textAlignVertical:'top'},invalid:{borderColor:'#A72424'},row:{flexDirection:'row',gap:8},choice:{flex:1,alignItems:'center',paddingVertical:12,backgroundColor:'white',borderColor:'#E1EBE3',borderWidth:1,borderRadius:12},selected:{backgroundColor:'#E3F4E8',borderColor:'#176B3A'},choiceText:{textTransform:'capitalize',color:'#526558',fontWeight:'700'},button:{padding:17,marginTop:28,backgroundColor:'#176B3A',alignItems:'center',borderRadius:13},buttonText:{color:'white',fontWeight:'800'},cancel:{textAlign:'center',marginTop:20,color:'#627266'},error:{color:'#A72424',marginTop:6}});
