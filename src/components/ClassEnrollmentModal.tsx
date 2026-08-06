import React, { useState, useEffect } from 'react';
import { PUBLIC_CLASSES_CATALOG } from '../data/classesData';
import { PublicClass, ClassEnrollmentDoc } from '../types';
import { User } from '../lib/firebase';
import {
  saveClassEnrollment,
  subscribeToUserEnrollments,
  cancelClassEnrollment,
} from '../lib/firestoreService';
import {
  getGoogleAccessToken,
  addTaskToList,
  getTaskLists,
  createTaskList,
} from '../lib/googleTasksService';
import {
  GraduationCap,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  User as UserIcon,
  BookOpen,
  Sparkles,
  Users,
  Send,
  Trash2,
  Award,
  ListTodo,
  AlertCircle,
  LogIn,
  Search,
  Filter,
} from 'lucide-react';

interface ClassEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const ClassEnrollmentModal: React.FC<ClassEnrollmentModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  // Active tab & Category filter
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-enrollments'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected class for enrollment
  const [classToEnroll, setClassToEnroll] = useState<PublicClass | null>(null);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate Producer');
  const [specialFocus, setSpecialFocus] = useState('');

  // User Enrollments from Firestore
  const [userEnrollments, setUserEnrollments] = useState<ClassEnrollmentDoc[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Google Tasks sync status
  const [isSyncingTasks, setIsSyncingTasks] = useState(false);

  // Initialize form with User details when available
  useEffect(() => {
    if (user) {
      setStudentName(user.displayName || '');
      setStudentEmail(user.email || '');
    }
  }, [user]);

  // Real-time Firestore sync for user's enrollments
  useEffect(() => {
    if (!user) {
      setUserEnrollments([]);
      return;
    }
    const unsubscribe = subscribeToUserEnrollments(user.uid, (enrollments) => {
      setUserEnrollments(enrollments);
    });
    return () => unsubscribe();
  }, [user]);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setStatusMsg({
        type: 'error',
        text: 'Please sign in or start a guest session in the header to enroll.',
      });
      return;
    }

    if (!classToEnroll) return;
    if (!studentName.trim() || !studentEmail.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill out student name and email.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMsg(null);

      await saveClassEnrollment(user.uid, {
        classId: classToEnroll.id,
        classTitle: classToEnroll.title,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        experienceLevel,
        specialFocus: specialFocus.trim(),
      });

      setStatusMsg({
        type: 'success',
        text: `Enrolled successfully in "${classToEnroll.title}"! Synced with Cloud Firestore.`,
      });

      setClassToEnroll(null);
      setActiveTab('my-enrollments');
    } catch (err: any) {
      console.error('Class enrollment error:', err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to submit class enrollment to Firestore.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    try {
      await cancelClassEnrollment(enrollmentId);
      setStatusMsg({ type: 'success', text: 'Enrollment cancelled successfully.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Cancel enrollment error:', err);
    }
  };

  // Export class schedule to Google Tasks
  const handleExportScheduleToTasks = async (enrollment: ClassEnrollmentDoc) => {
    const accessToken = getGoogleAccessToken();
    if (!accessToken) {
      setStatusMsg({
        type: 'error',
        text: 'Google Tasks authorization required. Open Google Tasks from top bar to authorize.',
      });
      return;
    }

    try {
      setIsSyncingTasks(true);
      const lists = await getTaskLists(accessToken);
      let targetListId = lists.length > 0 ? lists[0].id : '';

      if (!targetListId) {
        const newList = await createTaskList(accessToken, '🎓 Music Masterclasses & Classes');
        targetListId = newList.id;
      }

      const cls = PUBLIC_CLASSES_CATALOG.find((c) => c.id === enrollment.classId);

      await addTaskToList(accessToken, targetListId, {
        title: `🎓 Attend Class: ${enrollment.classTitle}`,
        notes: `Instructor: ${cls?.instructor || 'PromptCraft Master Class'}\nSchedule: ${cls?.schedule || 'Weekly'}\nFormat: ${cls?.format || 'Live Lab'}\nStudent: ${enrollment.studentName} (${enrollment.studentEmail})`,
      });

      setStatusMsg({
        type: 'success',
        text: `Added class schedule for "${enrollment.classTitle}" to Google Tasks!`,
      });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      console.error('Tasks sync error:', err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Failed to sync class schedule to Google Tasks.',
      });
    } finally {
      setIsSyncingTasks(false);
    }
  };

  const filteredClasses = PUBLIC_CLASSES_CATALOG.filter((cls) => {
    const matchesCategory =
      selectedCategory === 'All' || cls.category === selectedCategory;
    const matchesQuery =
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/30 rounded-xl text-white shadow-lg shadow-cyan-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Public Class Enrollment Portal</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Open Registration
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enroll in public music production masterclasses, prompt labs, and songwriting clinics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setActiveTab('catalog');
                setClassToEnroll(null);
              }}
              className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Public Classes Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('my-enrollments')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'my-enrollments'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>My Class Enrollments</span>
              {userEnrollments.length > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {userEnrollments.length}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 pb-3">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Community Learning Hub</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Status Message Banner */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fadeIn ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span>{statusMsg.text}</span>
              </div>
              <button
                onClick={() => setStatusMsg(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: CATALOG & ENROLLMENT FORM */}
          {activeTab === 'catalog' && (
            <>
              {/* If a specific class was clicked to enroll */}
              {classToEnroll ? (
                <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                        {classToEnroll.category}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">{classToEnroll.title}</h3>
                      <p className="text-xs text-slate-400">Instructor: {classToEnroll.instructor}</p>
                    </div>
                    <button
                      onClick={() => setClassToEnroll(null)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      ← Back to Catalog
                    </button>
                  </div>

                  {/* Enrollment Form */}
                  <form onSubmit={handleEnrollSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          Student Full Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          Student Email Address <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Experience Level</label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="Beginner Creator">Beginner Creator (New to Suno AI)</option>
                          <option value="Intermediate Producer">Intermediate Producer (PromptCraft User)</option>
                          <option value="Advanced Producer / Sound Engineer">
                            Advanced Producer / Sound Engineer
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          Special Focus / Questions for Instructor
                        </label>
                        <input
                          type="text"
                          value={specialFocus}
                          onChange={(e) => setSpecialFocus(e.target.value)}
                          placeholder="e.g. Interested in vocoder mixing & retrowave lyrics"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-200">
                          Format: {classToEnroll.format} • Schedule: {classToEnroll.schedule}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Enrollment confirmation & blueprint passes are persisted in Cloud Firestore.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Enrolling...' : 'Confirm Class Enrollment'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Catalog Grid */
                <div className="space-y-4">
                  {/* Category Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                      {['All', 'Prompt Engineering', 'Sound Design', 'Lyrics & Vocals', 'Copyright & Rights'].map(
                        (cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                              selectedCategory === cat
                                ? 'bg-cyan-500 text-slate-950 shadow-md'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search classes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Public Classes List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredClasses.map((cls) => {
                      const isAlreadyEnrolled = userEnrollments.some(
                        (e) => e.classId === cls.id && e.status === 'active'
                      );

                      return (
                        <div
                          key={cls.id}
                          className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls.badgeColor}`}>
                                {cls.category}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <Users className="w-3.5 h-3.5 text-cyan-400" />
                                <span>
                                  {cls.seatsAvailable} / {cls.maxSeats} Seats Left
                                </span>
                              </div>
                            </div>

                            <h3 className="text-sm font-bold text-white">{cls.title}</h3>

                            <p className="text-xs text-slate-400 line-clamp-2">{cls.description}</p>

                            <div className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                              <div className="flex items-center gap-2">
                                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                                <span>Instructor: <strong className="text-slate-300">{cls.instructor}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>Schedule: {cls.schedule}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>Duration: {cls.duration} • Format: {cls.format}</span>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {cls.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Enroll Trigger */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 font-mono">
                              {cls.level}
                            </span>

                            {isAlreadyEnrolled ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Enrolled</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!user) {
                                    setStatusMsg({
                                      type: 'error',
                                      text: 'Please sign in or start guest mode in the top header to enroll.',
                                    });
                                    return;
                                  }
                                  setClassToEnroll(cls);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Enroll Now</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: MY CLASS ENROLLMENTS */}
          {activeTab === 'my-enrollments' && (
            <div className="space-y-4">
              {!user ? (
                <div className="text-center py-12 space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl">
                  <LogIn className="w-10 h-10 text-cyan-400 mx-auto" />
                  <h3 className="text-sm font-bold text-white">Sign In Required</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Sign in with Google or use Guest Mode in the top navigation bar to view and manage your active class enrollments.
                  </p>
                </div>
              ) : userEnrollments.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl">
                  <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">No Active Enrollments Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Browse the Public Classes Catalog tab to register for Suno AI prompt engineering labs, sound design masterclasses, and lyrics clinics!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userEnrollments.map((enrollment) => {
                    const cls = PUBLIC_CLASSES_CATALOG.find((c) => c.id === enrollment.classId);

                    return (
                      <div
                        key={enrollment.id}
                        className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active Student
                            </span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                              ID: {enrollment.id.slice(0, 8)}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white">{enrollment.classTitle}</h3>

                          <p className="text-xs text-slate-400">
                            Student: <strong className="text-slate-200">{enrollment.studentName}</strong> ({enrollment.studentEmail}) • Level: {enrollment.experienceLevel}
                          </p>

                          {cls && (
                            <p className="text-[11px] text-cyan-300 font-medium">
                              Schedule: {cls.schedule} • Instructor: {cls.instructor}
                            </p>
                          )}

                          <p className="text-[10px] text-slate-500 font-mono">
                            Enrolled on: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleExportScheduleToTasks(enrollment)}
                            disabled={isSyncingTasks}
                            className="px-3 py-2 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                            title="Add Class to Google Tasks Schedule"
                          >
                            <ListTodo className="w-3.5 h-3.5 text-blue-200" />
                            <span>Add to Google Tasks</span>
                          </button>

                          <button
                            onClick={() => handleCancelEnrollment(enrollment.id)}
                            className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-xl transition-all"
                            title="Cancel Enrollment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>PromptCraft Academy & Open Enrollment Engine</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
