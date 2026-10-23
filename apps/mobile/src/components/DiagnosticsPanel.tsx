import React,{useState} from 'react';
import {Text,View} from 'react-native';
import {Button} from './UI';
import {styles as s,colors} from '../theme';
import {testProductionChain,exportDiagnostics} from '../services/diagnostics';
export function DiagnosticsPanel(){
  const [checks,setChecks]=useState<Awaited<ReturnType<typeof testProductionChain>>>([]);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function run(){setBusy(true);setError('');try{setChecks(await testProductionChain());}catch{setError('Vérification interrompue. Réessayez.');}finally{setBusy(false);}}
  return <View style={s.card}>
    <Text style={s.heading}>Diagnostic</Text>
    <Text style={s.muted}>Vérifier le serveur, les accès et les images reçues. La caméra reste désactivée sans votre action.</Text>
    <Button label="Vérifier la connexion" secondary busy={busy} onPress={()=>void run()}/>
    {checks.map(c=><View key={c.name} style={s.between}><Text style={s.body}>{c.name}</Text><Text style={[s.caption,{color:c.ok?colors.green:colors.muted,flex:1,textAlign:'right'}]}>{c.detail}</Text></View>)}
    {!!error&&<Text style={s.error}>{error}</Text>}
    <Button label="Partager le journal technique" secondary onPress={()=>void exportDiagnostics().catch(()=>setError('Partage impossible. Réessayez.'))}/>
    <Text style={s.caption}>Journal local des étapes récentes, sans mot de passe, vidéo, nom d’élève ni position GPS. Vous choisissez à qui l’envoyer.</Text>
  </View>;
}
