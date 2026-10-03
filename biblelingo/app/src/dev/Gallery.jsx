// Galeria dos componentes base (só em DEV): http://localhost:5179/?gallery=1
// Serve para conferir cada componente nos dois temas antes de migrar as telas, e como exemplo de uso de cada um.
import { useRef, useState } from "react";
import { CHARACTERS } from "../core/content.js";
import { unitVars, isDarkTheme } from "../core/palette.js";
import { state, save } from "../core/store.js";
import Icon from "../components/Icon.jsx";
import { ICON_NAMES } from "../icons/index.js";
import {
  Button3D, Card, CardList, CardItem, ProgressBar, ComboLabel, SegmentRing, Bubble, WordBankCore, Option, OptionGroup, ImageCard,
  MatchCell, MatchGrid, AudioButton, SpeakPrompt, MicButton, TextCard, Gap, FeedbackFooter, CharacterStage, Avatar, StatCard, CountUp,
  Chest, Sheet, ConfirmSheet, Snackbar, LessonBanner, HintTooltip, Badge, Pill, Chip, Toggle, QuestRow, StreakWeek, Flame, Medal, Shield, EmptyState,
} from "../components/ui/index.js";

const ch = (k) => (CHARACTERS[k] ? { key: k, ...CHARACTERS[k] } : null);

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-heading text-ink">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function Gallery() {
  const [fb, setFb] = useState(null);
  const [chosen, setChosen] = useState([]);
  const [opt, setOpt] = useState(null);
  const [text, setText] = useState("");
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [banner, setBanner] = useState("");
  const [toggle, setToggle] = useState(true);
  const [chestState, setChestState] = useState("ready");
  const [value, setValue] = useState(0.35);
  const xpRef = useRef(null);
  const noe = ch("noe") || ch(Object.keys(CHARACTERS)[0]);
  const dark = isDarkTheme();

  return (
    <div className="mx-auto max-w-[600px] px-4 pb-60 pt-6" style={unitVars("u2", dark)}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-display text-ink">Galeria UI</h1>
        <Button3D variant="neutral" size="sm" onClick={() => { state.theme = dark ? "light" : "dark"; save(); }}>Tema</Button3D>
      </div>

      <Section title="Button3D">
        <div className="flex flex-col gap-2">
          <Button3D variant="primary" size="cta" block>Verificar</Button3D>
          <Button3D variant="danger" size="cta" block>Entendi</Button3D>
          <Button3D variant="secondary" tone="green" size="cta" block icon="eye">Explique minha resposta</Button3D>
          <Button3D variant="neutral" block>Não, obrigado</Button3D>
          <Button3D variant="primary" size="cta" block disabled>Verificar</Button3D>
          <Button3D variant="primary" block loading>Carregando</Button3D>
          <div className="flex items-center gap-3">
            <Button3D variant="accent" icon="speaker">Ouvir</Button3D>
            <Button3D variant="icon" icon="notebook" iconOnly aria-label="Guia" />
            <span className="rounded-lg bg-unit p-2"><Button3D variant="icon" tone="white" icon="notebook" iconOnly aria-label="Guia" /></span>
            <span className="rounded-lg bg-unit p-2"><Button3D variant="on-unit" data-popover-start>Começar +10 XP</Button3D></span>
            <Button3D variant="ghost" size="md">Não posso ouvir agora</Button3D>
          </div>
        </div>
      </Section>

      <Section title="Card">
        <CardList className="flex flex-col gap-3">
          <CardItem><Card>Card estático</Card></CardItem>
          <CardItem><Card variant="interactive" className="w-full">Card clicável (afunda 2 px)</Card></CardItem>
          <CardItem><Card variant="parchment"><p className="text-body italic">“No princípio, Deus criou os céus e a terra.”</p><p className="mt-1 text-secondary font-bold text-parchment-text">Gênesis 1:1</p></Card></CardItem>
          <CardItem><Card variant="unit" stripe>Card do capítulo (u2, azul)</Card></CardItem>
        </CardList>
      </Section>

      <Section title="ProgressBar e ComboLabel">
        <div className="relative pt-5">
          <div className="absolute left-1/2 top-0 -translate-x-1/2"><ComboLabel combo={3} /></div>
          <ProgressBar variant="lesson" value={value} combo={3} />
        </div>
        <ProgressBar variant="lesson" value={0.7} combo={6} />
        <ProgressBar variant="labelled" value={7} max={10} label="7/10" />
        <ProgressBar variant="labelled" value={10} max={10} label="10/10" done delay={0.1} />
        <ProgressBar variant="story" value={0.5} />
        <ProgressBar variant="compact" value={0.25} />
        <Button3D variant="neutral" size="sm" onClick={() => setValue((v) => (v >= 1 ? 0.1 : v + 0.2))}>Avançar barra</Button3D>
      </Section>

      <Section title="SegmentRing">
        <div className="flex items-center gap-6">
          <SegmentRing size={94} stroke={6} segments={3} value={0.5}><span className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-unit text-unit-ink" style={{ boxShadow: "0 8px 0 var(--unit-shadow)" }}><Icon name="star" size={32} tone="mono" /></span></SegmentRing>
          <SegmentRing size={96} stroke={10} segments={1} value={0.8} color="#ffc800"><span className="text-numeral text-ink">80%</span></SegmentRing>
          <SegmentRing size={94} stroke={6} segments={5} value={0.6} color="#ffc800"><Icon name="trophy" size={32} /></SegmentRing>
        </div>
      </Section>

      <Section title="Bubble e CharacterStage">
        <div className="flex items-end gap-4">
          <CharacterStage ch={noe} variant="side" talking="auto" />
          <Bubble audio="God created the heaven and the earth" char={noe}>God created the <HintTooltip word="heaven" hint="céu" /> and the earth</Bubble>
        </div>
        <Bubble variant="wave" audio="The ark had a window" slow full />
        <div className="flex gap-3"><Bubble variant="hero">Come, follow me.</Bubble><Bubble variant="other">Where are you going?</Bubble></div>
        <div className="flex items-end justify-around">
          <CharacterStage ch={noe} variant="header" />
          <CharacterStage ch={noe} variant="result" state="celebrate" reaction="reaction-happy" />
        </div>
      </Section>

      <Section title="Avatar">
        <div className="flex items-end gap-3">
          <Avatar ch={noe} size={24} /><Avatar ch={noe} size={40} talking /><Avatar ch={noe} size={56} ring badge="check" />
          <Avatar ch={noe} size={72} reaction="reaction-sad" /><Avatar ch={null} size={56} locked /><Avatar ch={{ name: "Sem imagem" }} size={56} />
        </div>
      </Section>

      <Section title="WordBankCore">
        <WordBankCore bank={["the", "God", "earth", "created", "heaven", "and"]} chosen={chosen} onChange={setChosen} footer={<Button3D variant="ghost" size="sm" icon="keyboard">Usar teclado</Button3D>} />
      </Section>

      <Section title="Option, ImageCard, MatchCell">
        <OptionGroup cols={1}>
          {["só (sozinho)", "luz", "homem"].map((o, i) => (
            <Option key={o} index={i} value={o} state={opt === o ? "selected" : i === 2 ? "wrong" : "idle"} onSelect={setOpt} shortcut>{o}</Option>
          ))}
          <Option index={3} value="criar" state="correct">criar</Option>
        </OptionGroup>
        <OptionGroup cols={2}>
          <ImageCard index={0} value="terra" icon="🌍" state="idle">terra</ImageCard>
          <ImageCard index={1} value="céu" icon="☁️" state="selected">céu</ImageCard>
        </OptionGroup>
        <MatchGrid>
          <MatchCell side="en" keyId="ark" label="ark" state="idle" />
          <MatchCell side="pt" keyId="ark" label="arca" state="selected" />
          <MatchCell side="en" keyId="water" label="water" audio state="correct" />
          <MatchCell side="pt" keyId="water" label="água" state="done" />
        </MatchGrid>
      </Section>

      <Section title="AudioButton, MicButton, SpeakPrompt">
        <div className="flex items-center gap-4"><AudioButton text="earth" /><AudioButton variant="boxed" text="earth" /><AudioButton variant="slow" text="earth" /><AudioButton variant="wave" text="God created the heaven" /></div>
        <MicButton recording={false} /><MicButton recording error="Permita o uso do microfone ou pule este exercício." />
        <SpeakPrompt text="And the rain was upon the earth" char={noe} missed={["rain"]} onSkip={() => {}} />
      </Section>

      <Section title="TextCard e Gap">
        <TextCard value={text} onChange={setText} autoFocus={false} />
        <TextCard value="God created the earth" state="ok" autoFocus={false} />
        <Card><span className="text-sentence">And the <Gap value={text} onChange={setText} blank="rain" /> was upon the earth.</span></Card>
        <Card><span className="text-sentence">And the <Gap value="rain" blank="rain" display state="ok" /> was upon the earth.</span></Card>
      </Section>

      <Section title="StatCard, CountUp, Chest">
        <div className="flex justify-center gap-3.5">
          <div ref={xpRef}><StatCard label="XP" value={15} format={(v) => `+${v}`} icon="bolt" color="yellow" /></div>
          <StatCard label="Tempo" text="1:42" icon="timer" color="blue" />
          <StatCard label="Precisão" value={93} format={(v) => `${v}%`} icon="target" color="green" />
        </div>
        <div className="flex items-end justify-center gap-6">
          <Chest size={96} state={chestState} reward={5} targetRef={xpRef} onOpen={() => setChestState("opened")} />
          <Chest size={56} state="locked" /><Chest size={40} state="ready" />
        </div>
        <p className="text-numeral"><CountUp to={340} /> XP</p>
      </Section>

      <Section title="Badge, Pill, Chip, Toggle">
        <div className="flex flex-wrap items-center gap-3"><Badge kind="review" /><Badge kind="new-word" /><Badge kind="legendary" /><Badge kind="timer" /><Pill count={3} /><Pill count={120} /></div>
        <div className="flex flex-wrap gap-2"><Chip en="ark" pt="arca" icon="🚢" /><Chip en="rain" pt="chuva" svgIcon="sparkle" selected /></div>
        <div className="flex items-center gap-3"><Toggle checked={toggle} onChange={setToggle} label="Efeitos sonoros" /><Toggle checked={false} label="Desligado" /><Toggle checked disabled label="Travado" /></div>
      </Section>

      <Section title="QuestRow, StreakWeek, Flame">
        <Card><QuestRow icon="bolt" title="Ganhe 20 XP" value={15} target={20} reward={5} state="progress" /><QuestRow icon="book" title="Complete 2 lições" value={2} target={2} reward={5} state="ready" delay={0.08} /><QuestRow icon="star" title="Faça 1 lição perfeita" value={1} target={1} reward={10} state="claimed" delay={0.16} /></Card>
        <Card><StreakWeek days={{}} /></Card>
        <div className="flex items-end justify-around"><Flame size={48} count={5} /><Flame size={96} glow count={6} /><Flame size={48} lit={false} count={0} /></div>
      </Section>

      <Section title="Medal, Shield, EmptyState">
        <div className="flex flex-wrap gap-3">{["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"].map((u) => <Medal key={u} unitId={u} />)}<Medal unitId="u3" locked /></div>
        <div className="flex gap-3">{[1, 2, 3, 4, 5, 6].map((n) => <Shield key={n} n={n} level={n} />)}</div>
        <Card><EmptyState icon="flame-off" title="Sem missões ainda" text="Faça sua primeira lição para acender a chama" action={{ label: "Começar", onClick: () => {} }} /></Card>
      </Section>

      <Section title="Sheet, Snackbar, LessonBanner, FeedbackFooter">
        <div className="flex flex-wrap gap-2">
          <Button3D variant="neutral" onClick={() => setSheet(true)}>Abrir sheet</Button3D>
          <Button3D variant="neutral" onClick={() => setConfirm(true)}>Confirmar</Button3D>
          <Button3D variant="neutral" onClick={() => setToasts((t) => [...t, { id: Date.now(), text: "Exercícios de escuta pausados por 15 min", icon: "ear-off" }])}>Snackbar</Button3D>
          <Button3D variant="neutral" onClick={() => setBanner("Escuta pausada por 15 min")}>Banner</Button3D>
          <Button3D variant="neutral" onClick={() => setFb({ ok: true, praise: "Fez bonito!", line: "Deus criou o céu e a terra" })}>Rodapé acerto</Button3D>
          <Button3D variant="neutral" onClick={() => setFb({ ok: false, praise: "Incorreto", line: "God created the heaven and the earth" })}>Rodapé erro</Button3D>
          <Button3D variant="neutral" onClick={() => setFb(null)}>Rodapé neutro</Button3D>
        </div>
        <LessonBanner text={banner} icon="ear-off" onDone={() => setBanner("")} />
      </Section>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Você ficou sem corações" footer={<Button3D variant="primary" block onClick={() => setSheet(false)}>Praticar para recuperar</Button3D>}>
        <div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="heart-empty" size={28} />)}</div>
        <p className="mt-4 text-body text-ink-soft">Pratique uma etapa concluída para recuperar 1 coração.</p>
      </Sheet>
      <ConfirmSheet open={confirm} title="Apagar todo o progresso?" text="Isso apaga lições, estrelas e ofensiva deste aparelho." confirmLabel="Apagar" cancelLabel="Cancelar" danger onConfirm={() => setConfirm(false)} onCancel={() => setConfirm(false)} />
      <Snackbar queue={toasts} onDone={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      <FeedbackFooter fb={fb} cta={{ label: fb ? (fb.ok ? "Continuar" : "Entendi") : "Verificar", onClick: () => setFb(null), disabled: false }}
        secondary={fb && fb.ok ? { label: "Praticar pronúncia", icon: "mic" } : null} ghost={!fb ? { label: "Não posso ouvir agora", onClick: () => {} } : null}
        share={{ text: "God created the heaven and the earth", pt: "Deus criou o céu e a terra" }} onFlag={() => {}} />

      <Section title="Ícones">
        <div className="grid grid-cols-6 gap-3 text-ink">{ICON_NAMES.map((n) => <span key={n} className="flex flex-col items-center gap-1 text-[10px] text-ink-soft"><Icon name={n} size={32} />{n}</span>)}</div>
      </Section>
    </div>
  );
}
