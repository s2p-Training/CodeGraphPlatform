import React from "react";
import { Calendar, Building2, Circle, Rocket } from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { cn } from "../../lib/utils";
import type { UserProfile, WorkExperience, Project } from "../../types";

interface ProfilePreviewProps {
  profileData: UserProfile;
  workExperiences: WorkExperience[];
  projects: Project[];
}

/* ----------------------------------
   Preview Card
----------------------------------- */

interface PreviewCardProps {
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const PreviewCard = ({
  title,
  children,
  fullWidth = false,
}: PreviewCardProps) => {
  return (
    <div
      className={cn(
        "bg-[#0D0D0D] border border-zinc-800/50 rounded-[2rem] p-7 space-y-6 relative overflow-hidden group/preview-card hover:border-zinc-700/50 transition-colors",
        fullWidth && "md:col-span-2",
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
        {title} 22
      </h3>

      <div className="space-y-5">{children}</div>
    </div>
  );
};

/* ----------------------------------
   Preview Item
----------------------------------- */

interface PreviewItemProps {
  label: string;
  value?: string;
  isMarkdown?: boolean;
}

const PreviewItem = ({
  label,
  value,
  isMarkdown = false,
}: PreviewItemProps) => {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
        {label}
      </span>

      {isMarkdown ? (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {value || "Not Specified"}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm font-bold text-zinc-200 tracking-tight leading-tight">
          {value || "Not Specified"}
        </p>
      )}
    </div>
  );
};

/* ----------------------------------
   Date Formatter
----------------------------------- */

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

/* ----------------------------------
   Work Experience Preview Item
----------------------------------- */

const WorkExperiencePreviewItem = ({ exp }: { exp: WorkExperience }) => {
  const dateRange = `${formatDate(exp.startDate)} – ${
    exp.isOngoing ? "Present" : exp.endDate ? formatDate(exp.endDate) : "N/A"
  }`;

  return (
    <div className="group/strip relative flex flex-col gap-4 p-6 rounded-[1.5rem] bg-zinc-900/30 border border-zinc-800/50 hover:border-orange-500/30 transition-all duration-300 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover/strip:bg-orange-500/10 transition-all" />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-orange-500 shadow-xl shrink-0 group-hover/strip:border-orange-500/30 transition-colors">
            <Building2 size={20} />
          </div>

          <div className="min-w-0">
            <h4 className="text-lg font-bold text-white tracking-tight truncate group-hover/strip:text-orange-500 transition-colors">
              {exp.company}
            </h4>

            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 tracking-tight">
              <span className="truncate">{exp.role}</span>

              <Circle size={4} className="fill-zinc-700 text-zinc-700" />

              <span className="text-orange-500/80 shrink-0">{exp.mode}</span>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-widest shrink-0 shadow-inner group-hover/strip:border-zinc-700 transition-colors">
          <Calendar size={12} className="text-orange-500" />

          <span>{dateRange}</span>
        </div>
      </div>

      {/* Description */}
      {exp.description && (
        <div className="relative z-10 pl-16">
          <div className="prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-li:my-0.5 text-zinc-400 font-bold opacity-80 group-hover/strip:opacity-100 transition-opacity">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {exp.description}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

/* ----------------------------------
   Project Preview Item
----------------------------------- */

const ProjectPreviewItem = ({ proj }: { proj: Project }) => {
  const dateRange = `${formatDate(proj.startDate)} – ${
    proj.isOngoing ? "Ongoing" : proj.endDate ? formatDate(proj.endDate) : "N/A"
  }`;

  return (
    <div className="group/strip relative flex flex-col gap-4 p-6 rounded-[1.5rem] bg-zinc-900/30 border border-zinc-800/50 hover:border-orange-500/30 transition-all duration-300 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover/strip:bg-orange-500/10 transition-all" />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-orange-500 shadow-xl shrink-0 group-hover/strip:border-orange-500/30 transition-colors">
            <Rocket size={20} />
          </div>

          <div className="min-w-0">
            <h4 className="text-lg font-bold text-white tracking-tight truncate group-hover/strip:text-orange-500 transition-colors">
              {proj.title}
            </h4>

            <div className="text-xs font-bold text-zinc-500 tracking-tight truncate">
              {proj.role}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-widest shrink-0 shadow-inner group-hover/strip:border-zinc-700 transition-colors">
          <Calendar size={12} className="text-orange-500" />

          <span>{dateRange}</span>
        </div>
      </div>

      {/* Highlights */}
      {proj.highlights && (
        <div className="relative z-10 pl-16">
          <div className="prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-li:my-0.5 text-zinc-400 font-bold opacity-80 group-hover/strip:opacity-100 transition-opacity">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {proj.highlights}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

/* ----------------------------------
   Complete Profile Preview
----------------------------------- */

export default function ProfilePreview({
  profileData,
  workExperiences,
  projects,
}: ProfilePreviewProps) {
  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
          Profile Dashboard
        </h2>
      </div>

      {/* Preview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <PreviewCard title="Personal Information">
          <div className="grid grid-cols-1 gap-6">
            <PreviewItem label="Full Name" value={profileData.name} />

            <PreviewItem label="Username" value={profileData.username} />

            <PreviewItem label="Email" value={profileData.email} />

            <PreviewItem label="Profile Link" value={profileData.profileUrl} />

            <PreviewItem
              label="Location"
              value={
                profileData.location?.city
                  ? `${profileData.location.city}, ${
                      profileData.location.country || "India"
                    }`
                  : undefined
              }
            />
          </div>
        </PreviewCard>

        {/* Skills & Expertise */}
        <PreviewCard title="Skills & Expertise">
          <div className="space-y-6">
            <PreviewItem
              label="Languages"
              value={profileData.skills?.languages?.join(", ")}
            />

            <PreviewItem
              label="Frameworks"
              value={profileData.skills?.frameworks?.join(", ")}
            />

            <PreviewItem
              label="Databases"
              value={profileData.skills?.databases?.join(", ")}
            />

            <PreviewItem
              label="Tools"
              value={profileData.skills?.tools?.join(", ")}
            />
          </div>
        </PreviewCard>

        {/* Education & Experience */}
        <PreviewCard title="Education & Experience">
          <div className="space-y-6">
            <PreviewItem
              label="University"
              value={profileData.education?.collegeName}
            />

            <PreviewItem label="Degree" value={profileData.education?.degree} />

            <PreviewItem
              label="Current Role"
              value={profileData.education?.currentRole}
            />
          </div>
        </PreviewCard>

        {/* Social Presence */}
        <PreviewCard title="Social Presence">
          <div className="space-y-6">
            <PreviewItem
              label="Github"
              value={profileData.socialLinks?.github}
            />

            <PreviewItem
              label="Linkedin"
              value={profileData.socialLinks?.linkedin}
            />

            <PreviewItem
              label="Twitter"
              value={profileData.socialLinks?.twitter}
            />
          </div>
        </PreviewCard>

        {/* About Me */}
        <div className="md:col-span-2">
          <PreviewCard title="About Me">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {profileData.bio || "Tell the world about yourself..."}
              </ReactMarkdown>
            </div>
          </PreviewCard>
        </div>

        {/* Work Experience */}
        <div className="md:col-span-2">
          <PreviewCard title="Work Experience">
            <div className="space-y-4">
              {workExperiences.map((exp) => (
                <WorkExperiencePreviewItem key={exp.id} exp={exp} />
              ))}

              {workExperiences.length === 0 && (
                <p className="text-xs text-zinc-600 font-bold text-center py-4 tracking-widest uppercase">
                  No experience added yet
                </p>
              )}
            </div>
          </PreviewCard>
        </div>

        {/* Featured Projects */}
        <div className="md:col-span-2">
          <PreviewCard title="Featured Projects">
            <div className="space-y-4">
              {projects.map((proj) => (
                <ProjectPreviewItem key={proj.id} proj={proj} />
              ))}

              {projects.length === 0 && (
                <p className="text-xs text-zinc-600 font-bold text-center py-4 tracking-widest uppercase">
                  No projects added yet
                </p>
              )}
            </div>
          </PreviewCard>
        </div>
      </div>
    </motion.div>
  );
}
