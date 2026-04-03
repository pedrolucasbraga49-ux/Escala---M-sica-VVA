import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Users, User, Settings, Bell, LogOut, 
  ChevronLeft, ChevronRight, Check, X, Trash2, 
  Edit, Plus, MessageSquare, Download, Share2,
  FileText, CheckCircle, AlertCircle, ArrowLeftRight,
  Info, Search, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// --- DADOS INICIAIS ---
const INITIAL_MUSICIANS = [
  { id: 1, name: "Pedro Oliveira", login: "pedro", password: "123", functions: ["Ministro(a)", "Violão"] },
  { id: 2, name: "Maria Santos", login: "maria", password: "123", functions: ["Backing Vocal"] },
  { id: 3, name: "João Silva", login: "joao", password: "123", functions: ["Bateria"] },
  { id: 4, name: "Ana Costa", login: "ana", password: "123", functions: ["Teclado"] },
  { id: 5, name: "Carlos Souza", login: "carlos", password: "123", functions: ["Baixo"] },
  { id: 6, name: "Lucas Rocha", login: "lucas", password: "123", functions: ["Guitarra"] },
  { id: 7, name: "Sara Lima", login: "sara", password: "123", functions: ["Ministro(a)", "Backing Vocal"] }
];

const INITIAL_SERVICES = [
  { id: 1, name: "Culto de Celebração", date: "2024-05-05", time: "18:00", day: "Domingo", type: "Noite", availabilityOpen: true, scaleFinalized: false },
  { id: 2, name: "Culto de Doutrina", date: "2024-05-08", time: "19:30", day: "Quarta-feira", type: "Semana", availabilityOpen: true, scaleFinalized: false },
  { id: 3, name: "Culto de Jovens", date: "2024-05-11", time: "19:00", day: "Sábado", type: "Semana", availabilityOpen: true, scaleFinalized: false },
  { id: 4, name: "Culto da Família", date: "2024-06-02", time: "18:00", day: "Domingo", type: "Noite", availabilityOpen: true, scaleFinalized: false }
];

const INITIAL_SCALES = [
  { serviceId: 1, ministerId: 1, backingIds: [2, 7], instruments: { "Bateria": 3, "Teclado": 4, "Baixo": 5, "Guitarra": 6 } },
  { serviceId: 2, ministerId: 7, backingIds: [2], instruments: { "Violão": 1, "Teclado": 4, "Baixo": 5 } }
];

const ROLES = ["Ministro(a)", "Backing Vocal", "Guitarra", "Baixo", "Bateria", "Teclado", "Violão", "Saxofone", "Trompete", "Percussão", "Sonoplasta", "Projeção"];

// --- COMPONENTES ---

export default function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [musicians, setMusicians] = useState(() => {
    const saved = localStorage.getItem('church_musicians');
    return saved ? JSON.parse(saved) : INITIAL_MUSICIANS;
  });
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('church_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });
  const [scales, setScales] = useState(() => {
    const saved = localStorage.getItem('church_scales');
    return saved ? JSON.parse(saved) : INITIAL_SCALES;
  });
  const [availabilities, setAvailabilities] = useState(() => {
    const saved = localStorage.getItem('church_avail');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('church_notifs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('church_musicians', JSON.stringify(musicians));
    localStorage.setItem('church_services', JSON.stringify(services));
    localStorage.setItem('church_scales', JSON.stringify(scales));
    localStorage.setItem('church_avail', JSON.stringify(availabilities));
    localStorage.setItem('church_notifs', JSON.stringify(notifications));
  }, [musicians, services, scales, availabilities, notifications]);

  const handleLogout = () => { setUser(null); setView('home'); };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar user={user} setView={setView} onLogout={handleLogout} notifications={notifications} setNotifications={setNotifications} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'home' && <HomeView key="home" setView={setView} />}
          {view === 'general' && <GeneralScaleView key="general" services={services} scales={scales} musicians={musicians} />}
          {view === 'individual' && <IndividualScaleView key="individual" services={services} scales={scales} musicians={musicians} />}
          {view === 'availability' && <AvailabilityView key="availability" user={user} services={services} scales={scales} musicians={musicians} availabilities={availabilities} setAvailabilities={setAvailabilities} setNotifications={setNotifications} />}
          {view === 'admin' && <AdminPanel key="admin" musicians={musicians} setMusicians={setMusicians} services={services} setServices={setServices} scales={scales} setScales={setScales} availabilities={availabilities} setNotifications={setNotifications} notifications={notifications} />}
          {view === 'login_musician' && <LoginView key="login_musician" type="musician" setUser={setUser} setView={setView} musicians={musicians} />}
          {view === 'login_admin' && <LoginView key="login_admin" type="admin" setUser={setUser} setView={setView} />}
        </AnimatePresence>
      </main>
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-white/5">
        &copy; 2024 Escala Igreja Pro - Sistema de Gestão Musical
      </footer>
    </div>
  );
}

function Navbar({ user, setView, onLogout, notifications, setNotifications }: any) {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter((n: any) => !n.read && (user?.type === 'admin' || n.toId === user?.id)).length;

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-xl">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="bg-blue-600 p-2 rounded-lg"><Calendar className="text-white" size={20} /></div>
        <span className="font-title font-bold text-xl tracking-tight hidden sm:inline uppercase">Escala<span className="text-blue-400">Igreja</span></span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 hover:bg-white/10 rounded-full relative transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">{unreadCount}</span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 glass rounded-xl shadow-2xl p-4 max-h-96 overflow-y-auto scrollbar-hide">
                <h4 className="font-bold mb-3 border-b border-white/10 pb-2">Notificações</h4>
                {notifications.filter((n: any) => user.type === 'admin' || n.toId === user.id).length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center italic">Nenhuma notificação</p>
                ) : (
                  notifications.filter((n: any) => user.type === 'admin' || n.toId === user.id).reverse().map((n: any) => (
                    <div key={n.id} className={`p-3 rounded-lg mb-2 text-sm ${n.read ? 'opacity-50' : 'bg-white/5'}`}>
                      <p className="mb-2">{n.message}</p>
                      {n.type === 'swap_request' && n.status === 'pending' && user.type === 'musician' && (
                        <div className="flex gap-2">
                          <button onClick={() => {
                            setNotifications((prev: any) => prev.map((not: any) => not.id === n.id ? {...not, status: 'approved', read: true} : not));
                            alert("Troca aprovada!");
                          }} className="bg-green-600 px-3 py-1 rounded text-xs font-bold">Aprovar</button>
                          <button onClick={() => {
                            setNotifications((prev: any) => prev.map((not: any) => not.id === n.id ? {...not, status: 'rejected', read: true} : not));
                          }} className="bg-red-600 px-3 py-1 rounded text-xs font-bold">Recusar</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold hidden md:inline">{user.name}</span>
            <button onClick={onLogout} className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"><LogOut size={20} /></button>
          </div>
        ) : (
          <button onClick={() => setView('login_musician')} className="text-sm font-bold text-blue-400 hover:text-white transition-colors">Entrar</button>
        )}
      </div>
    </nav>
  );
}

function HomeView({ setView }: any) {
  const cards = [
    { id: 'general', title: 'Escala Geral', icon: Calendar, desc: 'Acesso livre para consulta de todos os cultos e equipes.', color: 'bg-blue-500' },
    { id: 'individual', title: 'Escala Individual', icon: User, desc: 'Consulte sua escala personalizada rapidamente.', color: 'bg-indigo-500' },
    { id: 'availability', title: 'Disponibilidade', icon: CheckCircle, desc: 'Informe seus dias de ausência e solicite trocas.', color: 'bg-emerald-500' },
    { id: 'admin', title: 'Painel Admin', icon: Settings, desc: 'Gestão de músicos, cultos, escalas e exportação.', color: 'bg-amber-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-title font-bold mb-4">Gestão de <span className="text-blue-400">Escalas</span></h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Organização profissional para o ministério de louvor e equipes técnicas.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map(card => (
          <div 
            key={card.id} 
            onClick={() => setView(card.id === 'admin' ? 'login_admin' : (card.id === 'availability' ? 'login_musician' : card.id))}
            className="glass p-8 rounded-3xl cursor-pointer btn-hover group flex items-start gap-6 shadow-lg"
          >
            <div className={`${card.color} p-5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <card.icon size={36} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-title font-bold mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function LoginView({ type, setUser, setView, musicians }: any) {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (type === 'admin') {
      if (login === 'admin' && pass === 'admin123') {
        setUser({ type: 'admin', name: 'Administrador' });
        setView('admin');
      } else setError('Credenciais de Administrador incorretas.');
    } else {
      const m = musicians.find((m: any) => m.login === login && m.password === pass);
      if (m) {
        setUser({ ...m, type: 'musician' });
        setView('availability');
      } else setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto glass p-10 rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-title font-bold mb-8 text-center">Login {type === 'admin' ? 'Admin' : 'Músico'}</h2>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm mb-2 text-gray-400 font-bold uppercase tracking-wider">Usuário</label>
          <input type="text" value={login} onChange={e => setLogin(e.target.value)} className="w-full p-4 rounded-xl outline-none bg-slate-800 border border-slate-700 focus:ring-2 ring-blue-400 transition-all" required />
        </div>
        <div>
          <label className="block text-sm mb-2 text-gray-400 font-bold uppercase tracking-wider">Senha</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-4 rounded-xl outline-none bg-slate-800 border border-slate-700 focus:ring-2 ring-blue-400 transition-all" required />
        </div>
        {error && <p className="text-red-400 text-xs flex items-center gap-2 bg-red-500/10 p-3 rounded-lg"><AlertCircle size={16} /> {error}</p>}
        <button type="submit" className="w-full bg-blue-600 py-4 rounded-xl font-bold text-lg btn-hover shadow-lg">Entrar</button>
        <button type="button" onClick={() => setView('home')} className="w-full text-gray-500 text-sm hover:text-white transition-colors font-bold">Voltar</button>
      </form>
    </motion.div>
  );
}

function ServiceCard({ service, scale, musicians, highlightId }: any) {
  if (!scale) return null;
  const minister = musicians.find((m: any) => m.id === scale.ministerId);
  const backings = scale.backingIds.map((id: any) => musicians.find((m: any) => m.id === id));
  
  return (
    <div className="glass p-8 rounded-3xl border-l-8 border-blue-600 flex flex-col md:flex-row gap-10 shadow-xl mb-6">
      <div className="md:w-1/4">
        <span className="text-blue-400 text-xs font-bold uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full mb-4 inline-block">{service.day} • {service.type}</span>
        <h3 className="text-2xl font-title font-bold mb-2">{service.name}</h3>
        <p className="text-gray-400 text-sm flex items-center gap-2 mb-1"><Calendar size={16} /> {new Date(service.date + 'T00:00').toLocaleDateString('pt-BR')}</p>
        <p className="text-gray-400 text-sm flex items-center gap-2"><Bell size={16} /> {service.time}h</p>
      </div>
      <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Ministro(a)</p>
          <p className={`text-lg font-bold ${minister?.id === highlightId ? 'text-blue-400' : ''}`}>{minister?.name || '---'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Backing Vocal</p>
          <div className="flex flex-wrap gap-2">
            {backings.length > 0 ? backings.map((b: any) => (
              <span key={b?.id} className={`text-sm bg-white/5 px-2 py-1 rounded ${b?.id === highlightId ? 'text-blue-400 font-bold border border-blue-400/30' : ''}`}>{b?.name}</span>
            )) : <span className="text-gray-600 italic">Nenhum</span>}
          </div>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Instrumentos</p>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(scale.instruments).map(([inst, mId]: any) => {
              const m = musicians.find((mus: any) => mus.id === mId);
              return <div key={inst} className="text-sm flex justify-between border-b border-white/5 pb-1"><b className="text-gray-400 font-normal">{inst}:</b> <span className={mId === highlightId ? 'text-blue-400 font-bold' : ''}>{m?.name}</span></div>
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralScaleView({ services, scales, musicians }: any) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const filtered = services.filter((s: any) => {
    const [y, m] = s.date.split('-');
    return parseInt(m) === month && parseInt(y) === year;
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-4xl font-title font-bold">Escala <span className="text-blue-400">Geral</span></h2>
        <div className="flex gap-4">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('pt-BR', {month: 'long'})}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
            {[2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? <p className="text-center py-20 text-gray-500 text-xl italic">Nenhum culto encontrado.</p> : 
          filtered.map((s: any) => <ServiceCard key={s.id} service={s} scale={scales.find((sc: any) => sc.serviceId === s.id)} musicians={musicians} />)
        }
      </div>
    </motion.div>
  );
}

function IndividualScaleView({ services, scales, musicians }: any) {
  const [musicianId, setMusicianId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const filtered = services.filter((s: any) => {
    const [y, m] = s.date.split('-');
    if (parseInt(m) !== month || parseInt(y) !== year) return false;
    const scale = scales.find((sc: any) => sc.serviceId === s.id);
    if (!scale) return false;
    const mId = parseInt(musicianId);
    return scale.ministerId === mId || scale.backingIds.includes(mId) || Object.values(scale.instruments).includes(mId);
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-4xl font-title font-bold">Escala <span className="text-blue-400">Individual</span></h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <select value={musicianId} onChange={e => setMusicianId(e.target.value)} className="p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none min-w-[250px]">
            <option value="">Selecione o Músico</option>
            {musicians.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('pt-BR', {month: 'long'})}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
            {[2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {!musicianId ? <p className="text-center py-20 text-gray-500 text-xl italic">Selecione um músico.</p> : 
          (filtered.length === 0 ? <p className="text-center py-20 text-gray-500 text-xl italic">Nenhum culto escalado.</p> : 
            filtered.map((s: any) => <ServiceCard key={s.id} service={s} scale={scales.find((sc: any) => sc.serviceId === s.id)} musicians={musicians} highlightId={parseInt(musicianId)} />)
          )
        }
      </div>
    </motion.div>
  );
}

function AvailabilityView({ user, services, scales, musicians, availabilities, setAvailabilities, setNotifications }: any) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showSwap, setShowSwap] = useState<number | null>(null);
  const [subId, setSubId] = useState('');

  const myServices = services.filter((s: any) => {
    const [y, m] = s.date.split('-');
    if (parseInt(m) !== month || parseInt(y) !== year) return false;
    const scale = scales.find((sc: any) => sc.serviceId === s.id);
    if (!scale) return false;
    return scale.ministerId === user.id || scale.backingIds.includes(user.id) || Object.values(scale.instruments).includes(user.id);
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const toggleAvail = (sId: number) => {
    const s = services.find((sv: any) => sv.id === sId);
    if (!s.availabilityOpen || s.scaleFinalized) return;
    
    const existing = availabilities.find((a: any) => a.serviceId === sId && a.musicianId === user.id);
    if (existing) {
      setAvailabilities((prev: any) => prev.filter((a: any) => !(a.serviceId === sId && a.musicianId === user.id)));
    } else {
      const just = prompt("Justificativa para a ausência:");
      if (just) setAvailabilities((prev: any) => [...prev, { serviceId: sId, musicianId: user.id, available: false, justification: just }]);
    }
  };

  const handleSwap = (sId: number) => {
    if (!subId) return;
    const sub = musicians.find((m: any) => m.id === parseInt(subId));
    const s = services.find((sv: any) => sv.id === sId);
    setNotifications((prev: any) => [...prev, {
      id: Date.now(),
      fromId: user.id,
      toId: sub.id,
      serviceId: sId,
      type: 'swap_request',
      status: 'pending',
      read: false,
      message: `${user.name} solicitou troca para o culto ${s.name} (${new Date(s.date + 'T00:00').toLocaleDateString()}). Você aceita?`
    }]);
    setShowSwap(null);
    setSubId('');
    alert("Solicitação enviada!");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-4xl font-title font-bold">Minha <span className="text-blue-400">Disponibilidade</span></h2>
        <div className="flex gap-4">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('pt-BR', {month: 'long'})}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
            {[2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {myServices.length === 0 ? <p className="text-center py-20 text-gray-500 text-xl italic">Nenhum culto escalado.</p> : 
          myServices.map((s: any) => {
            const avail = availabilities.find((a: any) => a.serviceId === s.id && a.musicianId === user.id);
            const isLocked = !s.availabilityOpen || s.scaleFinalized;
            
            return (
              <div key={s.id} className={`glass p-8 rounded-3xl border-l-8 transition-all duration-300 ${avail ? 'border-red-500 bg-red-500/5' : 'border-green-500 bg-green-500/5'}`}>
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{s.name}</h3>
                    <p className="text-sm text-gray-400">{new Date(s.date + 'T00:00').toLocaleDateString('pt-BR')} • {s.time}h</p>
                    {avail && <p className="text-sm text-red-400 mt-4 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 italic">Indisponível: {avail.justification}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowSwap(s.id)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-blue-400 transition-colors"
                      title="Solicitar Troca"
                    ><ArrowLeftRight size={24} /></button>
                    <button 
                      onClick={() => toggleAvail(s.id)}
                      disabled={isLocked}
                      className={`p-3 rounded-xl ${avail ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} ${isLocked ? 'opacity-30 cursor-not-allowed' : 'btn-hover shadow-lg'}`}
                    >
                      {avail ? <X size={24} /> : <Check size={24} />}
                    </button>
                  </div>
                </div>
                {showSwap === s.id && (
                  <div className="mt-8 p-6 bg-white/5 rounded-2xl flex flex-col sm:flex-row gap-4 items-end animate-in slide-in-from-top-4">
                    <div className="flex-grow w-full">
                      <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">Substituto</label>
                      <select value={subId} onChange={e => setSubId(e.target.value)} className="w-full p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
                        <option value="">Escolha um músico...</option>
                        {musicians.filter((m: any) => m.id !== user.id).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => handleSwap(s.id)} className="bg-blue-600 px-6 py-3 rounded-xl text-sm font-bold btn-hover flex-grow">Pedir</button>
                      <button onClick={() => setShowSwap(null)} className="text-gray-500 p-3 hover:text-white transition-colors"><X size={24} /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        }
      </div>
    </motion.div>
  );
}

function AdminPanel({ musicians, setMusicians, services, setServices, scales, setScales, availabilities, setNotifications, notifications }: any) {
  const [tab, setTab] = useState('cultos');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-center mb-12 border-b border-white/5 overflow-x-auto scrollbar-hide">
        {['cultos', 'escalas', 'musicos', 'disponibilidade', 'exportar'].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)}
            className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all duration-300 ${tab === t ? 'border-b-4 border-blue-400 text-blue-400' : 'text-gray-500 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'cultos' && <AdminServices services={services} setServices={setServices} />}
      {tab === 'musicos' && <AdminMusicians musicians={musicians} setMusicians={setMusicians} />}
      {tab === 'escalas' && <AdminScales services={services} scales={scales} setScales={setScales} musicians={musicians} setServices={setServices} />}
      {tab === 'disponibilidade' && <AdminAvailabilitySummary services={services} setServices={setServices} availabilities={availabilities} musicians={musicians} scales={scales} />}
      {tab === 'exportar' && <AdminExport services={services} scales={scales} musicians={musicians} />}
    </div>
  );
}

function AdminServices({ services, setServices }: any) {
  const [form, setForm] = useState({ name: '', date: '', time: '', day: 'Domingo', type: 'Noite' });
  const [editId, setEditId] = useState<number | null>(null);

  const save = (e: any) => {
    e.preventDefault();
    if (editId) setServices((prev: any) => prev.map((s: any) => s.id === editId ? { ...s, ...form } : s));
    else setServices((prev: any) => [...prev, { ...form, id: Date.now(), availabilityOpen: true, scaleFinalized: false }]);
    setForm({ name: '', date: '', time: '', day: 'Domingo', type: 'Noite' });
    setEditId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-1 glass p-8 rounded-3xl h-fit sticky top-24">
        <h3 className="font-bold mb-6">{editId ? 'Editar Culto' : 'Novo Culto'}</h3>
        <form onSubmit={save} className="space-y-4">
          <input type="text" placeholder="Nome do Culto" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 rounded-xl text-sm bg-slate-800 border-none outline-none" required />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full p-3 rounded-xl text-sm bg-slate-800 border-none outline-none" required />
            <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full p-3 rounded-xl text-sm bg-slate-800 border-none outline-none" required />
          </div>
          <select value={form.day} onChange={e => setForm({...form, day: e.target.value})} className="w-full p-3 rounded-xl text-sm font-bold bg-slate-800 border-none outline-none">
            {["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full p-3 rounded-xl text-sm font-bold bg-slate-800 border-none outline-none">
            <option value="Manhã">Manhã</option>
            <option value="Noite">Noite</option>
            <option value="Semana">Semana</option>
          </select>
          <button type="submit" className="w-full bg-blue-600 py-3 rounded-xl font-bold text-sm btn-hover shadow-lg">{editId ? 'Atualizar' : 'Cadastrar'}</button>
          {editId && <button type="button" onClick={() => setEditId(null)} className="w-full text-gray-500 text-xs font-bold mt-2">Cancelar</button>}
        </form>
      </div>
      <div className="lg:col-span-2 space-y-4">
        {services.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((s: any) => (
          <div key={s.id} className="glass p-6 rounded-2xl flex justify-between items-center shadow-lg">
            <div>
              <h4 className="font-bold text-lg">{s.name}</h4>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{new Date(s.date + 'T00:00').toLocaleDateString()} • {s.day} • {s.time}h</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => {setEditId(s.id); setForm(s);}} className="p-3 text-blue-400 hover:bg-blue-400/10 rounded-xl transition-colors"><Edit size={20} /></button>
              <button onClick={() => setServices((prev: any) => prev.filter((sv: any) => sv.id !== s.id))} className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMusicians({ musicians, setMusicians }: any) {
  const [form, setForm] = useState({ name: '', login: '', password: '', functions: [] as string[] });
  const [editId, setEditId] = useState<number | null>(null);

  const save = (e: any) => {
    e.preventDefault();
    if (editId) setMusicians((prev: any) => prev.map((m: any) => m.id === editId ? { ...m, ...form } : m));
    else setMusicians((prev: any) => [...prev, { ...form, id: Date.now() }]);
    setForm({ name: '', login: '', password: '', functions: [] });
    setEditId(null);
  };

  const toggleFunc = (f: string) => {
    setForm(prev => ({ ...prev, functions: prev.functions.includes(f) ? prev.functions.filter(x => x !== f) : [...prev.functions, f] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-1 glass p-8 rounded-3xl h-fit sticky top-24">
        <h3 className="text-xl font-bold mb-6">{editId ? 'Editar Músico' : 'Novo Músico'}</h3>
        <form onSubmit={save} className="space-y-4">
          <input type="text" placeholder="Nome Completo" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 rounded-xl text-sm bg-slate-800 border-none outline-none" required />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Login" value={form.login} onChange={e => setForm({...form, login: e.target.value})} className="w-full p-3 rounded-xl text-sm bg-slate-800 border-none outline-none" required />
            <input type="password" placeholder="Senha" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full p-3 rounded-xl text-sm bg-slate-800 border-none outline-none" required />
          </div>
          <div className="p-4 border border-white/10 rounded-xl max-h-52 overflow-y-auto scrollbar-hide bg-white/5">
            <p className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest">Funções</p>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map(f => (
                <label key={f} className="flex items-center gap-3 text-xs cursor-pointer hover:text-blue-400 transition-colors">
                  <input type="checkbox" checked={form.functions.includes(f)} onChange={() => toggleFunc(f)} className="accent-blue-400" /> {f}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 py-3 rounded-xl font-bold text-sm btn-hover shadow-lg">{editId ? 'Atualizar' : 'Cadastrar'}</button>
          {editId && <button type="button" onClick={() => setEditId(null)} className="w-full text-gray-500 text-xs font-bold mt-2">Cancelar</button>}
        </form>
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {musicians.map((m: any) => (
          <div key={m.id} className="glass p-6 rounded-2xl flex justify-between items-start shadow-lg">
            <div>
              <h4 className="font-bold text-lg">{m.name}</h4>
              <div className="flex flex-wrap gap-1 mt-2">
                {m.functions.map((f: string) => <span key={f} className="text-[10px] text-blue-400 font-bold uppercase bg-blue-400/10 px-2 py-0.5 rounded">{f}</span>)}
              </div>
              <p className="text-xs text-gray-500 mt-3 font-bold">Login: {m.login}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {setEditId(m.id); setForm(m);}} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-xl transition-colors"><Edit size={18} /></button>
              <button onClick={() => setMusicians((prev: any) => prev.filter((mus: any) => mus.id !== m.id))} className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminScales({ services, scales, setScales, musicians, setServices }: any) {
  const [sId, setSId] = useState('');
  const [form, setForm] = useState({ ministerId: 0, backingIds: [] as number[], instruments: {} as any });

  useEffect(() => {
    if (sId) {
      const sc = scales.find((s: any) => s.serviceId === parseInt(sId));
      if (sc) setForm(sc);
      else setForm({ ministerId: 0, backingIds: [], instruments: {} });
    }
  }, [sId, scales]);

  const save = () => {
    if (!sId) return;
    const serviceId = parseInt(sId);
    setScales((prev: any) => {
      const filtered = prev.filter((s: any) => s.serviceId !== serviceId);
      return [...filtered, { ...form, serviceId }];
    });
    alert("Escala salva!");
  };

  const finalize = () => {
    setServices((prev: any) => prev.map((s: any) => s.id === parseInt(sId) ? { ...s, scaleFinalized: true } : s));
    save();
  };

  const toggleBacking = (id: number) => {
    setForm(prev => ({ ...prev, backingIds: prev.backingIds.includes(id) ? prev.backingIds.filter(x => x !== id) : [...prev.backingIds, id] }));
  };

  const setInst = (inst: string, mId: string) => {
    setForm(prev => ({ ...prev, instruments: { ...prev.instruments, [inst]: parseInt(mId) } }));
  };

  return (
    <div className="max-w-4xl mx-auto glass p-10 rounded-[2.5rem] shadow-2xl">
      <h3 className="text-2xl font-title font-bold mb-8 flex items-center gap-3"><Users className="text-blue-400" /> Montar Escala</h3>
      <select value={sId} onChange={e => setSId(e.target.value)} className="w-full p-4 rounded-2xl mb-10 font-bold text-blue-400 glass bg-slate-800 border-none outline-none text-lg">
        <option value="">Selecione o Culto</option>
        {services.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((s: any) => <option key={s.id} value={s.id}>{new Date(s.date + 'T00:00').toLocaleDateString()} - {s.name}</option>)}
      </select>

      {sId && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Ministro(a)</label>
              <select value={form.ministerId} onChange={e => setForm({...form, ministerId: parseInt(e.target.value)})} className="w-full p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
                <option value="0">Selecione...</option>
                {musicians.filter((m: any) => m.functions.includes('Ministro(a)')).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Backing Vocal</label>
              <div className="grid grid-cols-2 gap-2 p-4 border border-white/10 rounded-xl max-h-40 overflow-y-auto scrollbar-hide bg-white/5">
                {musicians.filter((m: any) => m.functions.includes('Backing Vocal')).map((m: any) => (
                  <label key={m.id} className="flex items-center gap-3 text-xs cursor-pointer hover:text-blue-400 font-bold">
                    <input type="checkbox" checked={form.backingIds.includes(m.id)} onChange={() => toggleBacking(m.id)} className="accent-blue-400" /> {m.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-6 tracking-widest">Instrumentos</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {ROLES.filter(f => !['Ministro(a)', 'Backing Vocal'].includes(f)).map(inst => (
                <div key={inst} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-blue-400 mb-2 uppercase tracking-widest">{inst}</p>
                  <select value={form.instruments[inst] || ''} onChange={e => setInst(inst, e.target.value)} className="w-full p-2 rounded-lg text-xs font-bold glass bg-slate-800 border-none outline-none">
                    <option value="">---</option>
                    {musicians.filter((m: any) => m.functions.includes(inst)).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-10 border-t border-white/5">
            <button onClick={save} className="flex-1 bg-white/10 py-4 rounded-2xl font-bold btn-hover shadow-lg text-lg">Salvar</button>
            <button onClick={finalize} className="flex-1 bg-blue-600 py-4 rounded-2xl font-bold btn-hover shadow-lg text-lg">Finalizar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminAvailabilitySummary({ services, setServices, availabilities, musicians, scales }: any) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const filtered = services.filter((s: any) => {
    const [y, m] = s.date.split('-');
    return parseInt(m) === month && parseInt(y) === year;
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const toggleStatus = (id: number, field: string) => {
    setServices((prev: any) => prev.map((s: any) => s.id === id ? { ...s, [field]: !s[field] } : s));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-end gap-4 mb-10">
        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
          {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('pt-BR', {month: 'long'})}</option>)}
        </select>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="p-3 rounded-xl text-sm font-bold glass bg-slate-800 border-none outline-none">
          {[2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map((s: any) => {
          const scale = scales.find((sc: any) => sc.serviceId === s.id);
          const teamIds = scale ? [scale.ministerId, ...scale.backingIds, ...Object.values(scale.instruments)] : [];
          const serviceAvails = availabilities.filter((a: any) => a.serviceId === s.id);

          return (
            <div key={s.id} className="glass p-8 rounded-3xl shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-bold">{s.name}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{new Date(s.date + 'T00:00').toLocaleDateString()} • {s.time}h</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => toggleStatus(s.id, 'availabilityOpen')} className={`text-[10px] px-4 py-2 rounded-full font-bold transition-all shadow-lg ${s.availabilityOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    DISP: {s.availabilityOpen ? 'ABERTA' : 'FECHADA'}
                  </button>
                  <button onClick={() => toggleStatus(s.id, 'scaleFinalized')} className={`text-[10px] px-4 py-2 rounded-full font-bold transition-all shadow-lg ${s.scaleFinalized ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    ESCALA: {s.scaleFinalized ? 'FINALIZADA' : 'ABERTA'}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {teamIds.map((id: any) => {
                  const m = musicians.find((mus: any) => mus.id === id);
                  const av = serviceAvails.find((a: any) => a.musicianId === id);
                  return (
                    <div key={id} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md ${av ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`} title={av?.justification}>
                      {av ? <X size={14} /> : <Check size={14} />} {m?.name}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminExport({ services, scales, musicians }: any) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filtered = useMemo(() => {
    if (!start || !end) return [];
    return services.filter((s: any) => s.date >= start && s.date <= end).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [start, end, services]);

  useEffect(() => {
    setSelectedIds(filtered.map((s: any) => s.id));
  }, [filtered]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const exportWhatsApp = () => {
    const targetServices = filtered.filter((s: any) => selectedIds.includes(s.id));
    let msg = `🎵 *ESCALA DE LOUVOR* 🎵\n\n`;
    
    targetServices.forEach((s: any) => {
      const sc = scales.find((sc: any) => sc.serviceId === s.id);
      if (!sc) return;
      const minister = musicians.find((m: any) => m.id === sc.ministerId);
      const backings = sc.backingIds.map((id: any) => musicians.find((m: any) => m.id === id).name).join(', ');
      
      msg += `📅 *${new Date(s.date + 'T00:00').toLocaleDateString('pt-BR')} - ${s.name}* (${s.time}h)\n`;
      msg += `🎤 Ministro: ${minister?.name || '---'}\n`;
      msg += `🗣️ Backings: ${backings || '---'}\n`;
      Object.entries(sc.instruments).forEach(([inst, mId]: any) => {
        msg += `🎸 ${inst}: ${musicians.find((m: any) => m.id === mId)?.name || '---'}\n`;
      });
      msg += `\n------------------\n\n`;
    });

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const exportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const targetServices = filtered.filter((s: any) => selectedIds.includes(s.id));

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(13, 34, 68);
    doc.text("ESCALA DE CULTOS", 14, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Período: ${new Date(start + 'T00:00').toLocaleDateString()} até ${new Date(end + 'T00:00').toLocaleDateString()}`, 14, 28);

    const tableData = targetServices.map((s: any) => {
      const sc = scales.find((sc: any) => sc.serviceId === s.id);
      if (!sc) return [s.name, s.date, s.time, s.day, '---', '---', '---'];
      
      const minister = musicians.find((m: any) => m.id === sc.ministerId)?.name || '---';
      const backings = sc.backingIds.map((id: any) => musicians.find((m: any) => m.id === id)?.name).join(', ') || '---';
      const instruments = Object.entries(sc.instruments).map(([inst, mId]: any) => `${inst}: ${musicians.find((m: any) => m.id === mId)?.name}`).join('\n');

      return [
        s.name,
        new Date(s.date + 'T00:00').toLocaleDateString('pt-BR'),
        s.time + 'h',
        s.day,
        minister,
        backings,
        instruments
      ];
    });

    (doc as any).autoTable({
      startY: 35,
      head: [['Culto', 'Data', 'Horário', 'Dia', 'Ministro', 'Backing Vocal', 'Instrumentos']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [29, 111, 196], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 6: { cellWidth: 60 } }
    });

    doc.save(`escala-${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto glass p-8 rounded-3xl">
      <h3 className="text-2xl font-title font-bold mb-8 flex items-center gap-2"><Download className="text-blue-400" /> Exportar</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Início</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full p-3 rounded-xl bg-slate-800 border-none outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fim</label>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full p-3 rounded-xl bg-slate-800 border-none outline-none" />
        </div>
      </div>

      {filtered.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400 font-bold">{filtered.length} cultos encontrados.</p>
            <div className="flex gap-4">
              <button onClick={exportWhatsApp} className="flex items-center gap-2 bg-green-600 px-6 py-3 rounded-xl font-bold btn-hover text-sm"><Share2 size={18} /> WhatsApp</button>
              <button onClick={exportPDF} className="flex items-center gap-2 bg-red-600 px-6 py-3 rounded-xl font-bold btn-hover text-sm"><FileText size={18} /> PDF</button>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {filtered.map((s: any) => (
              <label key={s.id} className="flex items-center gap-4 p-4 glass rounded-xl cursor-pointer hover:bg-white/5">
                <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} className="w-5 h-5 accent-blue-400" />
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-xs text-gray-500">{new Date(s.date + 'T00:00').toLocaleDateString()} • {s.time}h</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
