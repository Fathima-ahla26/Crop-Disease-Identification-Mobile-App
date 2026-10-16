import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../lib/api';

export default function SmartScan() {
 const router=useRouter();
 const [photo,setPhoto]=useState<ImagePicker.ImagePickerAsset|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const choose=async(camera:boolean)=>{
  setError('');
  try {
   const permission=camera?await ImagePicker.requestCameraPermissionsAsync():await ImagePicker.requestMediaLibraryPermissionsAsync();
   if(!permission.granted){setError('Please allow access to your camera or photos.');return;}
   const options:ImagePicker.ImagePickerOptions={mediaTypes:['images'],allowsEditing:false,quality:0.65,base64:true};
   const result=camera?await ImagePicker.launchCameraAsync(options):await ImagePicker.launchImageLibraryAsync(options);
   if(!result.canceled && result.assets.length)setPhoto(result.assets[0]);
  }catch(e:any){setError(e.message||'Could not open image picker.');}
 };
 const analyze=async()=>{
  if(!photo?.base64){setError('Please add a photo before analyzing.');return;}
  setBusy(true);setError('');
  try{
   const result=await api<{id:number}>('/diagnoses/analyze',{method:'POST',body:JSON.stringify({imageBase64:photo.base64,mimeType:photo.mimeType||'image/jpeg'})});
   router.push({pathname:'/live-result',params:{id:String(result.id)}});
  }catch(e:any){setError(e.message||'Analysis failed. Please try again.');}finally{setBusy(false);}
 };
 return <View style={s.root}>
   <View style={s.top}><TouchableOpacity onPress={()=>router.back()}><Text style={s.back}>‹</Text></TouchableOpacity><Text style={s.brand}>CropCare  ✳</Text><View style={{width:22}}/></View>
   <ScrollView contentContainerStyle={s.body}>
    <View style={s.badge}><Text style={s.badgeText}>✦  AI-POWERED PLANT CARE</Text></View>
    <Text style={s.title}>Check your plant's health</Text>
    <Text style={s.subtitle}>Take a clear photo or choose one from your gallery. We'll look for possible signs of plant disease.</Text>
    <Text style={s.label}>YOUR PLANT PHOTO</Text>
    <View style={s.preview}>{photo?<Image source={{uri:photo.uri}} style={s.photo} resizeMode="contain"/>:<><Text style={s.camera}>📷</Text><Text style={s.placeholder}>Add a photo to get started</Text><Text style={s.hint}>Focus on an affected leaf in natural light</Text></>}</View>
    {photo&&<TouchableOpacity onPress={()=>setPhoto(null)} style={s.remove}><Text style={s.removeText}>✕  Remove photo</Text></TouchableOpacity>}
    <View style={s.row}><TouchableOpacity style={s.cameraButton} disabled={busy} onPress={()=>choose(true)}><Text style={s.cameraButtonText}>📷  Take Photo</Text></TouchableOpacity><TouchableOpacity style={s.galleryButton} disabled={busy} onPress={()=>choose(false)}><Text style={s.galleryButtonText}>▧  Gallery</Text></TouchableOpacity></View>
    {!!error&&<View style={s.errorBox}><Text style={s.error}>{error}</Text></View>}
    <TouchableOpacity style={[s.analyze,(!photo||busy)&&s.disabled]} disabled={!photo||busy} onPress={analyze}>{busy?<ActivityIndicator color="white"/>:<Text style={s.analyzeText}>✦  Analyze Image    →</Text>}</TouchableOpacity>
    <View style={s.note}><Text style={s.noteTitle}>ⓘ  A note about AI results</Text><Text style={s.noteText}>AI screening is preliminary and may be incorrect. An agricultural officer should confirm important decisions.</Text></View>
    <TouchableOpacity onPress={()=>router.push('/photo-guides')}><Text style={s.guide}>Tips for a better photo  →</Text></TouchableOpacity>
   </ScrollView>
  </View>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#F7FAF6'},top:{backgroundColor:'#155C38',paddingVertical:18,paddingHorizontal:22,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},back:{color:'white',fontSize:29,lineHeight:27},brand:{fontSize:18,fontWeight:'900',color:'white'},body:{padding:22,paddingBottom:50},badge:{alignSelf:'flex-start',backgroundColor:'#E1F1E5',paddingHorizontal:12,paddingVertical:8,borderRadius:50},badgeText:{fontSize:10,fontWeight:'900',letterSpacing:1,color:'#16603A'},title:{fontSize:28,color:'#123B27',fontWeight:'900',marginTop:18,lineHeight:35},subtitle:{fontSize:14,color:'#687B6D',lineHeight:22,marginTop:9,marginBottom:27},label:{fontSize:11,color:'#456E53',fontWeight:'900',letterSpacing:1.2,marginBottom:12},preview:{height:270,backgroundColor:'#EFF6EE',borderColor:'#BBD7C3',borderWidth:2,borderStyle:'dashed',borderRadius:23,alignItems:'center',justifyContent:'center',overflow:'hidden'},photo:{width:'100%',height:'100%'},camera:{fontSize:52},placeholder:{fontSize:16,fontWeight:'900',color:'#20553A',marginTop:14},hint:{fontSize:12,color:'#879A8B',marginTop:8,textAlign:'center'},remove:{alignSelf:'flex-end',padding:9},removeText:{color:'#AF4949',fontWeight:'700',fontSize:12},row:{flexDirection:'row',gap:12,marginTop:16},cameraButton:{flex:1,alignItems:'center',backgroundColor:'#E2F1E5',paddingVertical:17,borderRadius:14},cameraButtonText:{color:'#155C38',fontSize:13,fontWeight:'900'},galleryButton:{flex:1,alignItems:'center',backgroundColor:'white',borderWidth:1,borderColor:'#C8DDCC',paddingVertical:17,borderRadius:14},galleryButtonText:{color:'#155C38',fontSize:13,fontWeight:'900'},analyze:{alignItems:'center',backgroundColor:'#16683C',paddingVertical:18,borderRadius:17,marginTop:23},analyzeText:{fontSize:16,fontWeight:'900',color:'white'},disabled:{opacity:.5},note:{backgroundColor:'#EDF2E8',padding:17,borderRadius:16,marginTop:22},noteTitle:{color:'#466345',fontSize:13,fontWeight:'900'},noteText:{color:'#6D806D',lineHeight:20,fontSize:12,marginTop:7},guide:{fontWeight:'800',textAlign:'center',color:'#16683C',marginTop:24},errorBox:{padding:13,backgroundColor:'#FFEDEC',borderRadius:12,marginTop:15},error:{color:'#A83333',lineHeight:19}});
