"""Provisional French voice. Replace these stems with the selected voice for release."""
import asyncio,ssl,json,subprocess
from pathlib import Path
import edge_tts
import edge_tts.communicate as ec
ec._SSL_CTX=ssl.create_default_context(cafile='/etc/ssl/certs/ca-certificates.crt')
P=Path(__file__).parent
scripts=["Tu cherches une paire qui te ressemble ?","Eh, regarde ça ! Sur CLOGZ, tu choisis ton mood.","Dix coloris. Une couleur, une attitude.","Ta paire, ta couleur, ta pointure.","Et tu sais quoi ? Les pins sont offerts.","Douze mille francs CFA la paire.","Explore aussi notre univers et nos packs.","À Dakar, livraison gratuite. Et tu paies à la réception.","Rendez-vous sur CLOGZ point S N. Dey Daw Rek !"]
async def main():
 for i,s in enumerate(scripts):
  f=P/'assets'/f'voice-{i}.mp3'
  if f.exists() and f.stat().st_size>1000:continue
  await edge_tts.Communicate(s,'fr-FR-RemyMultilingualNeural',rate='+0%',pitch='+0Hz').save(str(f))
  print('voice',i,flush=True)
 (P/'assets'/'narration.json').write_text(json.dumps(scripts,ensure_ascii=False,indent=2))
asyncio.run(main())
