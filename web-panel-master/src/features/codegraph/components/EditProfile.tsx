import React from "react";

import {
  User,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Code2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Terminal,
  Database,
  Wrench,
  Building2,
  Calendar,
  Monitor,
  Rocket,
  Plus,
  X,
} from "lucide-react";

import { cn } from "../lib/utils";

import { UserProfile, WorkExperience, Project } from "../types";

import MDEditor from "@uiw/react-md-editor";

import rehypeRaw from "rehype-raw";

import { motion } from "motion/react";

interface EditProfileProps {
  profileData: UserProfile;

  setProfileData: React.Dispatch<React.SetStateAction<UserProfile>>;

  yearOptions: string[];

  workExperiences: WorkExperience[];

  projects: Project[];

  updateWorkExperience: (
    id: string,

    field: keyof WorkExperience,

    value: any,
  ) => void;

  updateProject: (id: string, field: keyof Project, value: any) => void;

  handleAddExperience: () => void;

  handleRemoveExperience: (id: string) => void;

  toggleWorkOngoing: (id: string) => void;

  handleAddProject: () => void;

  handleRemoveProject: (id: string) => void;

  toggleProjectOngoing: (id: string) => void;

  onSave: () => void;
}

const InputField = ({
  label,

  placeholder = "",

  value,

  onChange,

  type = "text",

  icon: Icon,

  required,

  disabled,
}: {
  label: string;

  placeholder?: string;

  value?: string;

  onChange?: (val: string) => void;

  type?: string;

  icon?: any;

  required?: boolean;

  disabled?: boolean;
}) => (
  <div className={cn("space-y-1.5 w-full", disabled && "opacity-50")}>
       {" "}
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-0.5">
            {label} {required && <span className="text-red-500">*</span>} 
       {" "}
    </label>
       {" "}
    <div className="relative group">
           {" "}
      {Icon && (
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors"
          size={14}
        />
      )}
           {" "}
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onClick={(e) => {
          if (type === "date" && !disabled) {
            try {
              (e.target as any).showPicker();
            } catch {}
          }
        }}
        className={cn(
          "w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm text-zinc-200 focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700",

          Icon && "pl-10",

          type === "date" &&
            "appearance-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer",

          disabled && "cursor-not-allowed",
        )}
      />
         {" "}
    </div>
     {" "}
  </div>
);

const CheckboxField = ({
  label,

  checked,

  onChange,
}: {
  label: string;

  checked: boolean;

  onChange: (checked: boolean) => void;
}) => (
  <label className="flex items-center gap-2.5 cursor-pointer group">
       {" "}
    <div
      className={cn(
        "w-4 h-4 rounded-md border flex items-center justify-center transition-all",

        checked
          ? "bg-orange-500 border-orange-500 scale-110"
          : "bg-zinc-900 border-zinc-800 group-hover:border-zinc-700",
      )}
    >
            {checked && <span className="text-white text-xs font-bold">✓</span>}
         {" "}
    </div>
       {" "}
    <input
      type="checkbox"
      className="hidden"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
       {" "}
    <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {label}   {" "}
    </span>
     {" "}
  </label>
);

const SelectField = ({
  label,

  placeholder,

  value,

  options,

  onChange,

  required,

  icon: Icon,
}: {
  label: string;

  placeholder: string;

  value?: string;

  options: string[];

  onChange: (val: string) => void;

  required?: boolean;

  icon?: any;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="space-y-1.5 flex-1 min-w-[200px] relative"
      ref={containerRef}
    >
           {" "}
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-0.5">
                {label} {required && <span className="text-red-500">*</span>}   
         {" "}
      </label>
           {" "}
      <div className="relative group">
               {" "}
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors"
            size={14}
          />
        )}
               {" "}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm text-zinc-400 flex items-center justify-between hover:border-zinc-700 transition-colors",

            Icon && "pl-10",
          )}
        >
                   {" "}
          <span className={cn("truncate", value && "text-zinc-200")}>
                        {value || placeholder}         {" "}
          </span>
                   {" "}
          <span
            className={cn(
              "text-zinc-600 transition-transform",

              isOpen && "rotate-180",
            )}
          >
                        ▼          {" "}
          </span>
                 {" "}
        </button>
             {" "}
      </div>
           {" "}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-[#141414] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                   {" "}
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => {
                onChange(option);

                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-orange-500/10 hover:text-orange-500 flex items-center justify-between",

                value === option
                  ? "text-orange-500 bg-orange-500/5"
                  : "text-zinc-400",
              )}
            >
                            <span>{option}</span>             {" "}
              {value === option && <span>✓</span>}           {" "}
            </button>
          ))}
                 {" "}
        </div>
      )}
         {" "}
    </div>
  );
};

const MarkdownEditorField = ({
  label,

  value,

  onChange,

  height = 200,
}: {
  label: string;

  value?: string;

  onChange: (val: string) => void;

  height?: number;
}) => (
  <div className="space-y-1.5 w-full" data-color-mode="dark">
       {" "}
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-0.5">
            {label}   {" "}
    </label>
       {" "}
    <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950 shadow-inner">
           {" "}
      <MDEditor
        value={value || ""}
        onChange={(val) => onChange(val || "")}
        preview="edit"
        height={height}
        className="!bg-transparent !border-none custom-md-editor"
        previewOptions={{
          rehypePlugins: [[rehypeRaw as any, { allowDangerousHtml: true }]],
        }}
      />
         {" "}
    </div>
     {" "}
  </div>
);

const Section = ({
  title,

  children,

  onSave,

  onAdd,
}: {
  title: string;

  children: React.ReactNode;

  onSave?: () => void;

  onAdd?: () => void;
}) => (
  <div className="space-y-4">
       {" "}
    <div className="flex items-center justify-between px-1">
           {" "}
      <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                {title}     {" "}
      </h2>
           {" "}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-orange-500 hover:border-orange-500/30 transition-all group"
        >
                   {" "}
          <Plus
            size={12}
            className="group-hover:rotate-90 transition-transform"
          />
                    Add More        {" "}
        </button>
      )}
         {" "}
    </div>
       {" "}
    <div className="bg-[#0D0D0D] border border-zinc-800/50 rounded-3xl p-8 space-y-8 relative overflow-hidden group/section">
           {" "}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            {children}     {" "}
      {onSave && (
        <div className="flex justify-end pt-4 border-t border-zinc-800/30">
                   {" "}
          <button
            type="button"
            onClick={onSave}
            className="bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white text-xs font-bold py-2.5 px-8 rounded-xl border border-orange-500/20 hover:border-orange-500 transition-all duration-300 shadow-lg shadow-orange-500/10"
          >
                        Save Changes          {" "}
          </button>
                 {" "}
        </div>
      )}
         {" "}
    </div>
     {" "}
  </div>
);

export default function EditProfile({
  profileData,

  setProfileData,

  yearOptions,

  workExperiences,

  projects,

  updateWorkExperience,

  updateProject,

  handleAddExperience,

  handleRemoveExperience,

  toggleWorkOngoing,

  handleAddProject,

  handleRemoveProject,

  toggleProjectOngoing,

  onSave,
}: EditProfileProps) {
  return (
    <motion.div
      key="edit"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12 pb-24"
    >
           {" "}
      <div className="space-y-1">
               {" "}
        <h1 className="text-4xl font-bold text-white tracking-tight leading-none">
                    Edit Profile        {" "}
        </h1>
               {" "}
        <p className="text-zinc-500 font-semibold text-base">
                    Update your professional details and social presence.      
           {" "}
        </p>
             {" "}
      </div>
           {" "}
      <Section title="Core Information" onSave={onSave}>
               {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {" "}
          <InputField
            label="Full Name"
            placeholder="e.g. Pranay Ramteke"
            icon={User}
            value={profileData.name}
            onChange={(val) =>
              setProfileData((prev) => ({ ...prev, name: val }))
            }
          />
                   {" "}
          <InputField
            label="Username"
            placeholder="e.g. pranay_pro"
            icon={User}
            value={profileData.username}
            onChange={(val) =>
              setProfileData((prev) => ({ ...prev, username: val }))
            }
          />
                   {" "}
          <InputField
            label="Profile URL"
            placeholder="quizmaster.pro/p/username"
            icon={Globe}
            value={profileData.profileUrl}
            onChange={(val) =>
              setProfileData((prev) => ({ ...prev, profileUrl: val }))
            }
          />
                   {" "}
          <InputField
            label="Official Email"
            placeholder="name@email.com"
            icon={Mail}
            value={profileData.email}
            type="email"
            onChange={(val) =>
              setProfileData((prev) => ({ ...prev, email: val }))
            }
          />
                   {" "}
          <InputField
            label="Phone Contact"
            placeholder="+91 00000 00000"
            icon={Phone}
            value={profileData.phone}
            onChange={(val) =>
              setProfileData((prev) => ({ ...prev, phone: val }))
            }
          />
                   {" "}
          <InputField
            label="Date of Birth"
            placeholder="DD-MM-YYYY"
            icon={Calendar}
            value={profileData.dob}
            type="date"
            onChange={(val) =>
              setProfileData((prev) => ({ ...prev, dob: val }))
            }
          />
                   {" "}
          <InputField
            label="Current City"
            placeholder="e.g. Nagpur, India"
            icon={MapPin}
            value={profileData.location?.city}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                location: { ...prev.location, city: val },
              }))
            }
          />
                 {" "}
        </div>
             {" "}
      </Section>
           {" "}
      <Section title="Education Details" onSave={onSave}>
               {" "}
        <div className="space-y-8">
                   {" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {" "}
            <SelectField
              label="Graduation Year"
              placeholder="Select Year"
              options={yearOptions}
              value={profileData.education?.graduationYear}
              onChange={(val) =>
                setProfileData((prev) => ({
                  ...prev,

                  education: {
                    ...prev.education,

                    graduationYear: val,
                  },
                }))
              }
            />
                       {" "}
            <InputField
              label="Branch / Major"
              placeholder="e.g. Computer Science"
              icon={Briefcase}
              value={profileData.education?.branch}
              onChange={(val) =>
                setProfileData((prev) => ({
                  ...prev,

                  education: {
                    ...prev.education,

                    branch: val,
                  },
                }))
              }
            />
                     {" "}
          </div>
                   {" "}
          <InputField
            label="Institution / University Name"
            placeholder="Enter your full college or university name"
            icon={Building2}
            value={profileData.education?.collegeName}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                education: {
                  ...prev.education,

                  collegeName: val,
                },
              }))
            }
          />
                 {" "}
        </div>
             {" "}
      </Section>
           {" "}
      <Section title="Professional Bio" onSave={onSave}>
               {" "}
        <MarkdownEditorField
          label="Biography"
          value={profileData.bio}
          onChange={(val) => setProfileData((prev) => ({ ...prev, bio: val }))}
          height={250}
        />
             {" "}
      </Section>
           {" "}
      <Section title="Digital Presence" onSave={onSave}>
               {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {" "}
          <InputField
            label="GitHub"
            placeholder="github.com/username"
            icon={Github}
            value={profileData.socialLinks?.github}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                socialLinks: {
                  ...prev.socialLinks,

                  github: val,
                },
              }))
            }
          />
                   {" "}
          <InputField
            label="Twitter / X"
            placeholder="twitter.com/username"
            icon={Twitter}
            value={profileData.socialLinks?.twitter}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                socialLinks: {
                  ...prev.socialLinks,

                  twitter: val,
                },
              }))
            }
          />
                   {" "}
          <InputField
            label="LinkedIn"
            placeholder="linkedin.com/in/username"
            icon={Linkedin}
            value={profileData.socialLinks?.linkedin}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                socialLinks: {
                  ...prev.socialLinks,

                  linkedin: val,
                },
              }))
            }
          />
                   {" "}
          <InputField
            label="Portfolio"
            placeholder="yourwebsite.com"
            icon={Globe}
            value={profileData.socialLinks?.others}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                socialLinks: {
                  ...prev.socialLinks,

                  others: val,
                },
              }))
            }
          />
                   {" "}
          <div className="md:col-span-2">
                       {" "}
            <InputField
              label="Resume URL"
              placeholder="Link to your PDF resume (Drive, Dropbox, etc.)"
              icon={ExternalLink}
              value={profileData.socialLinks?.resume}
              onChange={(val) =>
                setProfileData((prev) => ({
                  ...prev,

                  socialLinks: {
                    ...prev.socialLinks,

                    resume: val,
                  },
                }))
              }
            />
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </Section>
           {" "}
      <Section title="Technical Expertise" onSave={onSave}>
               {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {" "}
          <InputField
            label="Languages"
            placeholder="C++, Java, Python, JavaScript"
            icon={Terminal}
            value={profileData.skills?.languages?.join(", ")}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                skills: {
                  ...prev.skills,

                  languages: val.split(",").map((s) => s.trim()),
                },
              }))
            }
          />
                   {" "}
          <InputField
            label="Frameworks"
            placeholder="React, Node.js, Spring Boot"
            icon={Code2}
            value={profileData.skills?.frameworks?.join(", ")}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                skills: {
                  ...prev.skills,

                  frameworks: val.split(",").map((s) => s.trim()),
                },
              }))
            }
          />
                   {" "}
          <InputField
            label="Databases"
            placeholder="MongoDB, PostgreSQL, MySQL"
            icon={Database}
            value={profileData.skills?.databases?.join(", ")}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                skills: {
                  ...prev.skills,

                  databases: val.split(",").map((s) => s.trim()),
                },
              }))
            }
          />
                   {" "}
          <InputField
            label="Tools"
            placeholder="Git, Docker, Kubernetes, AWS"
            icon={Wrench}
            value={profileData.skills?.tools?.join(", ")}
            onChange={(val) =>
              setProfileData((prev) => ({
                ...prev,

                skills: {
                  ...prev.skills,

                  tools: val.split(",").map((s) => s.trim()),
                },
              }))
            }
          />
                 {" "}
        </div>
             {" "}
      </Section>
           {" "}
      <Section
        title="Professional Journey"
        onSave={onSave}
        onAdd={handleAddExperience}
      >
               {" "}
        <div className="space-y-12">
                   {" "}
          {workExperiences.map((exp, index) => (
            <div
              key={exp.id}
              className="space-y-8 relative group/exp bg-zinc-900/20 p-8 rounded-[2rem] border border-zinc-800/50"
            >
                           {" "}
              <div className="flex items-center justify-between">
                               {" "}
                <div className="flex items-center gap-4">
                                   {" "}
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-xs">
                                        {index + 1}                 {" "}
                  </div>
                                   {" "}
                  <span className="text-sm font-bold text-white tracking-tight">
                                        Work Experience {index + 1}             
                       {" "}
                  </span>
                                 {" "}
                </div>
                               {" "}
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all"
                >
                                    <X size={16} />               {" "}
                </button>
                             {" "}
              </div>
                           {" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {" "}
                <InputField
                  label="Company"
                  placeholder="e.g. Google"
                  icon={Building2}
                  value={exp.company}
                  onChange={(val) =>
                    updateWorkExperience(exp.id, "company", val)
                  }
                  required
                />
                               {" "}
                <SelectField
                  label="Mode"
                  placeholder="Select Mode"
                  icon={Monitor}
                  options={["Remote", "On-site", "Hybrid"]}
                  value={exp.mode}
                  onChange={(val) => updateWorkExperience(exp.id, "mode", val)}
                  required
                />
                               {" "}
                <InputField
                  label="Role"
                  placeholder="e.g. Software Engineer"
                  icon={User}
                  value={exp.role}
                  onChange={(val) => updateWorkExperience(exp.id, "role", val)}
                  required
                />
                               {" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                   {" "}
                  <InputField
                    label="Start Date"
                    value={exp.startDate}
                    type="date"
                    icon={Calendar}
                    onChange={(val) =>
                      updateWorkExperience(exp.id, "startDate", val)
                    }
                    required
                  />
                                   {" "}
                  <div className="space-y-3">
                                       {" "}
                    <InputField
                      label="End Date"
                      value={exp.endDate}
                      type="date"
                      icon={Calendar}
                      onChange={(val) =>
                        updateWorkExperience(exp.id, "endDate", val)
                      }
                      required={!exp.isOngoing}
                      disabled={exp.isOngoing}
                    />
                                       {" "}
                    <CheckboxField
                      label="Currently working here"
                      checked={exp.isOngoing || false}
                      onChange={() => toggleWorkOngoing(exp.id)}
                    />
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div className="md:col-span-2">
                                   {" "}
                  <MarkdownEditorField
                    label="Key Responsibilities"
                    value={exp.description}
                    onChange={(val) =>
                      updateWorkExperience(exp.id, "description", val)
                    }
                    height={250}
                  />
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
          ))}
                   {" "}
          {workExperiences.length === 0 && (
            <button
              type="button"
              onClick={handleAddExperience}
              className="w-full py-8 border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600 hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all flex flex-col items-center gap-3 font-bold text-sm"
            >
                            <Plus size={24} />              Add Work Experience
                         {" "}
            </button>
          )}
                 {" "}
        </div>
             {" "}
      </Section>
           {" "}
      <Section title="Projects" onSave={onSave} onAdd={handleAddProject}>
               {" "}
        <div className="space-y-12">
                   {" "}
          {projects.map((proj, index) => (
            <div
              key={proj.id}
              className="space-y-8 relative group/exp bg-zinc-900/20 p-8 rounded-[2rem] border border-zinc-800/50"
            >
                           {" "}
              <div className="flex items-center justify-between">
                               {" "}
                <div className="flex items-center gap-4">
                                   {" "}
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-xs">
                                        {index + 1}                 {" "}
                  </div>
                                   {" "}
                  <span className="text-sm font-bold text-white tracking-tight">
                                        Project {index + 1}               
                     {" "}
                  </span>
                                 {" "}
                </div>
                               {" "}
                <button
                  type="button"
                  onClick={() => handleRemoveProject(proj.id)}
                  className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all"
                >
                                    <X size={16} />               {" "}
                </button>
                             {" "}
              </div>
                           {" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {" "}
                <InputField
                  label="Project Title"
                  placeholder="e.g. E-Commerce Platform"
                  icon={Rocket}
                  value={proj.title}
                  onChange={(val) => updateProject(proj.id, "title", val)}
                  required
                />
                               {" "}
                <InputField
                  label="Role"
                  placeholder="e.g. Full Stack Developer"
                  icon={User}
                  value={proj.role}
                  onChange={(val) => updateProject(proj.id, "role", val)}
                  required
                />
                               {" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                   {" "}
                  <InputField
                    label="Start Date"
                    value={proj.startDate}
                    type="date"
                    icon={Calendar}
                    onChange={(val) => updateProject(proj.id, "startDate", val)}
                    required
                  />
                                   {" "}
                  <div className="space-y-3">
                                       {" "}
                    <InputField
                      label="End Date"
                      value={proj.endDate}
                      type="date"
                      icon={Calendar}
                      onChange={(val) => updateProject(proj.id, "endDate", val)}
                      required={!proj.isOngoing}
                      disabled={proj.isOngoing}
                    />
                                       {" "}
                    <CheckboxField
                      label="Ongoing project"
                      checked={proj.isOngoing || false}
                      onChange={() => toggleProjectOngoing(proj.id)}
                    />
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <div className="md:col-span-2">
                                   {" "}
                  <MarkdownEditorField
                    label="Project Highlights / Bullet Points"
                    value={proj.highlights}
                    onChange={(val) =>
                      updateProject(proj.id, "highlights", val)
                    }
                    height={250}
                  />
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
          ))}
                   {" "}
          {projects.length === 0 && (
            <button
              type="button"
              onClick={handleAddProject}
              className="w-full py-8 border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600 hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all flex flex-col items-center gap-3 font-bold text-sm"
            >
                            <Plus size={24} />              Add Project        
                 {" "}
            </button>
          )}
                 {" "}
        </div>
             {" "}
      </Section>
         {" "}
    </motion.div>
  );
}
