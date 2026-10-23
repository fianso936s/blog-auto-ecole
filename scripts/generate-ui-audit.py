from pathlib import Path
from html import escape
import json
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph,Table,TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT.parents[1]/'deliverables'
OUT.mkdir(exist_ok=True)
CAT=json.loads((ROOT/'docs/PEDAGOGY_CATALOG_1_6_0.json').read_text())
STATUS=Path('/tmp/repere-release32-state.json')
state=json.loads(STATUS.read_text()) if STATUS.exists() else {'buildStatus':'IN_PROGRESS','submittedToApple':False}
pdfmetrics.registerFont(TTFont('Repere','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('RepereBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('Repere',normal='Repere',bold='RepereBold',italic='Repere',boldItalic='RepereBold')
W,H=595.276,841.89
wine='#672C3B';cream='#F5F0E8';ink='#292427';muted='#726568';line='#E7DEDA'
rows=[
 ('Navigation centrée sur la carte et une bibliothèque séparée.','Fiches, Carte, Vidéos, Mon espace. Barre fixe dans cet ordre.','Apprendre, pratiquer, revoir puis gérer son compte.'),
 ('Carte entourée de commandes et flèches de déplacement.','Carte sur toute la zone utile, commandes flottantes, 2D / 3D pendant la capture. Flèches masquées.','Voir davantage le parcours sans perdre les actions essentielles.'),
 ('Visibilité des parcours dans le formulaire de modification.','Bouton « Publier pour les élèves » directement sur chaque parcours autorisé.','Comprendre et vérifier ce que les élèves peuvent ouvrir.'),
 ('Pas de classement par centre d’examen.','Centre enregistré, filtres visibles, recherche, choix d’un centre existant et rubrique « À classer ».','Retrouver rapidement le bon parcours et limiter la ressaisie.'),
 ('Filtres de même couleur, niveaux peu différenciés.','Couleurs par thème, rouge pour les vigilances, coche pour le filtre sélectionné.','Reconnaître l’importance sans dépendre uniquement de la couleur.'),
 ('Fiches pédagogiques disponibles seulement en PDF.','19 fiches et 58 étapes, explications, exemples, erreurs à éviter et point de vigilance.','Lire et réviser facilement sur un téléphone.'),
]
styles={
 'body':ParagraphStyle('body',fontName='Repere',fontSize=10,leading=15,textColor=HexColor(ink)),
 'small':ParagraphStyle('small',fontName='Repere',fontSize=8.3,leading=12,textColor=HexColor(ink)),
 'muted':ParagraphStyle('muted',fontName='Repere',fontSize=9,leading=14,textColor=HexColor(muted)),
 'white':ParagraphStyle('white',fontName='RepereBold',fontSize=9,leading=13,textColor=white),
}
c=canvas.Canvas(str(OUT/'AUDIT_UI_UX_LE_REPERE_1_6_0.pdf'),pagesize=(W,H))
c.setTitle('Le Repère Permis - Audit UI / UX et refonte 1.6.0');c.setAuthor('Le Repère Permis')
def para(text,x,y,width=499,style='body'):
 p=Paragraph(text,styles[style]);_,h=p.wrap(width,800);p.drawOn(c,x,y-h);return y-h

def base(page,title,kicker):
 c.setFillColor(HexColor(cream));c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(HexColor(wine));c.setFont('RepereBold',9);c.drawString(48,H-45,'LE REPÈRE PERMIS')
 c.setFillColor(HexColor(muted));c.setFont('Repere',8);c.drawRightString(W-48,H-45,'REFONTE 1.6.0')
 c.setFillColor(HexColor(line));c.rect(48,51,W-96,0.6,fill=1,stroke=0)
 c.setFillColor(HexColor(muted));c.setFont('Repere',8);c.drawString(48,36,'Audit des interfaces et des parcours d’usage');c.drawRightString(W-48,36,f'{page} / 3')
 c.setFillColor(HexColor(wine));c.setFont('RepereBold',9);c.drawString(48,H-87,kicker)
 c.setFillColor(HexColor(ink));c.setFont('RepereBold',26);c.drawString(48,H-121,title)
 return H-143

y=base(1,'Plus claire. Plus pédagogique.','01  /  INTERFACE ET SIMPLICITÉ')
y=para('L’identité bordeaux et crème est conservée. Les changements privilégient les tâches quotidiennes de l’élève et de l’enseignant, avec une action principale visible et des libellés explicites.',48,y)-20
c.setFillColor(HexColor(wine));c.roundRect(48,y-57,W-96,57,12,fill=1,stroke=0)
labels=['01  Fiches','02  Carte','03  Vidéos','04  Mon espace']
for i,label in enumerate(labels):
 c.setFillColor(white);c.setFont('RepereBold',9);c.drawCentredString(48+(W-96)*(i+.5)/4,y-34,label)
y-=82
cells=[[Paragraph(t,styles['white']) for t in ['Avant','Après','Pourquoi']]]
for row in rows:cells.append([Paragraph(escape(t),styles['small']) for t in row])
t=Table(cells,colWidths=[144,211,144],hAlign='LEFT')
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor(wine)),('BACKGROUND',(0,1),(-1,-1),HexColor('#FFFCF7')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),11),('BOTTOMPADDING',(0,0),(-1,-1),11),('LINEBELOW',(0,1),(-1,-1),.5,HexColor(line))]))
_,th=t.wrap(499,650);t.drawOn(c,48,y-th);y-=th+17
para('Méthode : audit du code, des libellés, des états et des parcours d’usage. Les contrôles techniques ne remplacent pas une observation sur iPhone réel.',48,y,style='muted')
c.showPage()

y=base(2,'19 fiches, 58 étapes expliquées.','02  /  MODULE PÉDAGOGIQUE')
y=para('Chaque fiche reprend une situation de conduite avec un objectif, une explication étape par étape, le « pourquoi », un exemple concret, les erreurs à éviter et une phrase à retenir. Le ton s’adresse directement à l’élève, à partir des deux PDF fournis.',48,y)-18
for g,color in [('C1','#69469A'),('C2','#255EA5'),('Manœuvres','#3F7663'),('Sécurité','#B42332')]:
 group=[co for co in CAT['courses'] if co['group']==g]
 c.setFillColor(HexColor(color));c.setFont('RepereBold',11);c.drawString(48,y-10,{'C1':'C1 - Maîtriser le véhicule','C2':'C2 - Circuler et anticiper'}.get(g,g));y-=25
 for co in group:
  c.setFillColor(HexColor(muted));c.setFont('Repere',8.8);c.drawString(52,y,co['code'])
  c.setFillColor(HexColor(ink));c.setFont('Repere',9.3);c.drawString(95,y,co['title']);y-=20
 y-=11
y-=5
para('<b>Révision personnelle.</b> Recherche par mot-clé, filtres C1 / C2 / Manœuvres / Sécurité, favoris « À revoir » et suivi des fiches lues sur cet iPhone, séparé par compte. Une fiche lue ne valide pas une compétence de conduite.',48,y)
c.showPage()

y=base(3,'Publication et repères fiables.','03  /  UTILISATION ET VÉRIFICATION')
for title,text in [
 ('Publier un parcours','Carte → Les parcours → renseigner le centre → Publier pour les élèves. Le tracé GPS et ses repères deviennent accessibles aux comptes connectés de cette application. Un élève ne peut pas publier.'),
 ('Retrouver le bon centre','Les centres déjà utilisés sont proposés lors de la saisie. La liste des parcours se filtre par centre, nom, difficulté, catégorie et favoris. Les parcours existants sans centre restent dans « À classer ».'),
 ('Conserver une information honnête','Une modification non synchronisée porte la mention « Modifications en attente ». La confirmation de publication intervient après vérification du serveur. Retirer la publication conserve les attributions individuelles déjà accordées.'),
 ]:
 c.setFillColor(HexColor(wine));c.setFont('RepereBold',12);c.drawString(48,y,title);y-=10
 y=para(text,48,y)-22
c.setFillColor(HexColor(wine));c.setFont('RepereBold',12);c.drawString(48,y,'Couleurs et lisibilité');y-=20
legend=[('Rouge','#B42332','Vigilances, direct et capture'),('Bleu','#255EA5','Centres et observation'),('Vert','#3F7663','États confirmés et réussite'),('Violet','#69469A','Maîtrise et manœuvres')]
for i,(name,color,text) in enumerate(legend):
 x=48+(i%2)*258;yy=y-(i//2)*31
 c.setFillColor(HexColor(color));c.circle(x+5,yy+2,4,fill=1,stroke=0)
 c.setFillColor(HexColor(ink));c.setFont('RepereBold',9);c.drawString(x+16,yy,name)
 c.setFont('Repere',8);c.setFillColor(HexColor(muted));c.drawString(x+16,yy-12,text)
y-=79
status='Compilation iOS en cours ; version non encore disponible dans TestFlight.'
if state.get('buildStatus')=='FINISHED':status='Compilation iOS 1.6.0 (32) réussie ; vérification du fichier signé en cours.'
if state.get('submissionId'):status='Compilation iOS 1.6.0 (32) vérifiée ; envoi à Apple en cours.'
if state.get('releaseError'):status='Compilation iOS 1.6.0 (32) vérifiée ; envoi à TestFlight non abouti. Le code et le serveur sont prêts.'
if state.get('appleProcessingState')=='VALID':status='Version iOS 1.6.0 (32) traitée par Apple.'
if state.get('internalGroupEnabled'):status='Version iOS 1.6.0 (32) disponible pour le groupe TestFlight interne existant.'
y=para('<b>Vérifications.</b> 85 tests unitaires réussis ; 75 scénarios API réussis ; contrôles TypeScript, JavaScript iOS et 5 contrôles natifs statiques réussis. Migration du centre testée sur une copie de la base puis appliquée au serveur. API 1.6.0 déployée. '+escape(status)+' La vérification tactile et visuelle sur iPhone physique reste à effectuer.',48,y)-19
y=para('<b>Contenu corrigé.</b> Certaines formulations des PDF ont été nuancées pour éviter de présenter tout oubli comme automatiquement éliminatoire ou d’encourager une prise de risque avec un piéton. Les repères de placement dépendent du véhicule et de l’installation.',48,y)-15
links=[('Examen pratique, article 27','https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000024518860'),('Piétons, R415-11','https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037411323'),('Distances, R412-12','https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051682619'),('Dépassement, R414-4','https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006842216')]
para('Références : '+ ' · '.join(f'<link href="{url}" color="{wine}">{escape(label)}</link>' for label,url in links),48,y,style='muted')
c.save()
md='''# Le Repère Permis - Audit UI / UX 1.6.0\n\nAudit du code des interfaces et des parcours d’usage. La vérification visuelle et tactile sur iPhone physique reste à effectuer.\n\n| Avant | Après | Pourquoi |\n| --- | --- | --- |\n'''
md+='\n'.join('| '+' | '.join(r)+' |' for r in rows)
md+='\n\n## Contenu pédagogique\n\n19 fiches, 58 étapes expliquées à partir des deux PDF fournis. Chaque fiche inclut objectif, explications et pourquoi, exemple, erreurs, vigilance et phrase à retenir. Progression de lecture locale par compte ; elle ne vaut pas validation de compétence.\n\n'
md+='\n'.join(f'- {co["code"]} : {co["title"]} ({co["sourcePages"]})' for co in CAT['courses'])
md+='\n\n## Publication et données\n\nLe centre est optionnel pour les anciens clients. Une mise à jour par le client 1.5.x qui omet le champ conserve le centre existant. Aucun parcours réel n’a été publié automatiquement. Les comptes connectés voient les parcours publiés ; les attributions privées restent possibles. La publication vérifie les autorisations, la synchronisation et l’état retourné par le serveur.\n\n## Vérification\n\n85 tests unitaires, 75 scénarios API, 5 contrôles natifs statiques, TypeScript et bundle JavaScript iOS réussis. Migration additive 014 testée sur branche de copie puis appliquée à la branche iOS. API déploiement 27, révision pedagogy-centers-ui-20261022, réponse santé confirmée.\n\n'+status+'\n\n'
md+='## Références du contenu reformulé\n\n'+'\n'.join(f'- [{label}]({url})' for label,url in links)+'\n'
(ROOT/'docs/AUDIT_UI_UX_1_6_0.md').write_text(md)
print(OUT/'AUDIT_UI_UX_LE_REPERE_1_6_0.pdf')
