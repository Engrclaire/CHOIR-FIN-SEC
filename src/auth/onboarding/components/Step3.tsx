import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Step3Modal from './Step3Modal';

interface Levy {
  name: string;
  amount: string;
  frequency: string;
  isCompulsory: boolean;
}

interface Event {
  name: string;
  committee: string;
  startDate: string;
  endDate: string;
}

interface TeamMember {
  fullName: string;
  email: string;
  role: string;
}

interface Step3Props {
  onSubmit?: (data: { levies: Levy[]; events: Event[]; teamMembers: TeamMember[] }) => void;
}

const Step3 = ({ onSubmit }: Step3Props) => {
  const [levies, setLevies] = useState<Levy[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showLevyModal, setShowLevyModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [levyForm, setLevyForm] = useState<Levy>({
    name: '',
    amount: '',
    frequency: 'Yearly',
    isCompulsory: false,
  });

  const [eventForm, setEventForm] = useState<Event>({
    name: '',
    committee: '',
    startDate: '',
    endDate: '',
  });

  const [inviteForm, setInviteForm] = useState<TeamMember>({
    fullName: '',
    email: '',
    role: '',
  });

  const handleLevyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setLevyForm(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setLevyForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInviteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInviteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddLevy = () => {
    if (levyForm.name && levyForm.amount && levyForm.frequency) {
      setLevies([...levies, levyForm]);
      setLevyForm({
        name: '',
        amount: '',
        frequency: 'Yearly',
        isCompulsory: false,
      });
      setShowLevyModal(false);
    }
  };

  const handleAddEvent = () => {
    if (eventForm.name && eventForm.startDate) {
      setEvents([...events, eventForm]);
      setEventForm({
        name: '',
        committee: '',
        startDate: '',
        endDate: '',
      });
      setShowEventModal(false);
    }
  };

  const handleAddMember = () => {
    if (inviteForm.fullName && inviteForm.email && inviteForm.role) {
      setTeamMembers([...teamMembers, inviteForm]);
      setInviteForm({
        fullName: '',
        email: '',
        role: '',
      });
      setShowInviteModal(false);
    }
  };

  const handleRemoveLevy = (index: number) => {
    setLevies(levies.filter((_, i) => i !== index));
  };

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleRemoveMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        levies,
        events,
        teamMembers,
      });
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-12">
      {/* Set Up Levies Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-2">Set Up Levies</h2>
        <p className="text-zinc-600 mb-6 text-sm md:text-md">Create common levies that members need to pay</p>

        <button
          type="button"
          onClick={() => setShowLevyModal(true)}
          className="w-full flex items-center justify-center gap-3 px-6 py-2 border border-zinc-300 rounded-xl font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Add Levy
        </button>

        {levies.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-zinc-700 mb-3">Added Levies ({levies.length})</p>
            <div className="space-y-2">
              {levies.map((levy, index) => (
                <div key={index} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-900">{levy.name}</p>
                    <p className="text-sm text-zinc-600">₦{parseFloat(levy.amount).toLocaleString('en-NG')} · {levy.frequency}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLevy(index)}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Events/Committees Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-2">Create Events/Committees</h2>
        <p className="text-zinc-600 mb-6 text-sm md:text-md">Set up events that will have separate financial tracking</p>

        <button
          type="button"
          onClick={() => setShowEventModal(true)}
          className="w-full flex items-center justify-center gap-3 px-6 py-2 border border-zinc-300 rounded-xl font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Add Event/Committee
        </button>

        {events.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-zinc-700 mb-3">Added Events ({events.length})</p>
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-900">{event.name}</p>
                    <p className="text-sm text-zinc-600">{event.committee ? `${event.committee} · ` : ''}{event.startDate}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvent(index)}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Team Members Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-2">Invite Team Members</h2>
        <p className="text-zinc-600 mb-6 text-sm md:text-md">Invite Financial Secretaries and Committee Leads to collaborate</p>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="w-full flex items-center justify-center gap-3 px-6 py-2 border border-zinc-300 rounded-xl font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Invite User
        </button>

        <p className="text-xs text-zinc-600 text-center mt-3">System will automatically send login credentials via email.</p>

        {teamMembers.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-zinc-700 mb-3">Invited Members ({teamMembers.length})</p>
            <div className="space-y-2">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-900">{member.fullName}</p>
                    <p className="text-sm text-zinc-600">{member.email} · {member.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals Component */}
      <Step3Modal
        showLevyModal={showLevyModal}
        setShowLevyModal={setShowLevyModal}
        showEventModal={showEventModal}
        setShowEventModal={setShowEventModal}
        levyForm={levyForm}
        handleLevyFormChange={handleLevyFormChange}
        handleAddLevy={handleAddLevy}
        eventForm={eventForm}
        handleEventFormChange={handleEventFormChange}
        handleAddEvent={handleAddEvent}
        showInviteModal={showInviteModal}
        setShowInviteModal={setShowInviteModal}
        inviteForm={inviteForm}
        handleInviteFormChange={handleInviteFormChange}
        handleAddMember={handleAddMember}
      />
    </form>
  );
};

export default Step3;
