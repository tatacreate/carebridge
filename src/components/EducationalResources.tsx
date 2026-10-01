import React, { useState } from 'react';
import { Language, EducationalArticle, VideoGuide, FAQItem } from '../types';
import { getTranslation } from '../data/translations';
import {
  BookOpen,
  Video,
  HelpCircle,
  Clock,
  ShieldCheck,
  Activity,
  Utensils,
  CheckCircle2,
  Search,
  Printer,
  Share2,
  Play,
  Film,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Pill,
  AlertTriangle,
} from 'lucide-react';

interface EducationalResourcesProps {
  currentLanguage: Language;
  articles: EducationalArticle[];
  videos: VideoGuide[];
  faqs: FAQItem[];
}

export const EducationalResources: React.FC<EducationalResourcesProps> = ({
  currentLanguage,
  articles,
  videos,
  faqs,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'faqs'>('articles');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(articles[0]?.id || null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(faqs[0]?.id || null);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoGuide | null>(null);

  const isRtl = currentLanguage === 'ar' || currentLanguage === 'ur';

  // Category translation helper
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'all': return getTranslation(currentLanguage, 'catAll');
      case 'wound_care': return getTranslation(currentLanguage, 'catWound');
      case 'dvt_prevention': return getTranslation(currentLanguage, 'catDVT');
      case 'nutrition': return getTranslation(currentLanguage, 'catNutrition');
      case 'medication_safety': return getTranslation(currentLanguage, 'catMeds');
      case 'warning_signs': return getTranslation(currentLanguage, 'catWarnings');
      default: return cat;
    }
  };

  const categories = ['all', 'wound_care', 'dvt_prevention', 'nutrition', 'medication_safety', 'warning_signs'];

  // Category Icon
  const renderCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'wound_care': return <ShieldCheck className="w-4 h-4" />;
      case 'dvt_prevention': return <Activity className="w-4 h-4" />;
      case 'nutrition': return <Utensils className="w-4 h-4" />;
      case 'medication_safety': return <Pill className="w-4 h-4" />;
      case 'warning_signs': return <AlertTriangle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  // Filter Articles
  const filteredArticles = articles.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const titleText = art.title[currentLanguage] || art.title.en || '';
    const summaryText = art.summary[currentLanguage] || art.summary.en || '';
    const matchesQuery =
      searchQuery === '' ||
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summaryText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filter Videos
  const filteredVideos = videos.filter((vid) => {
    const matchesCat = selectedCategory === 'all' || vid.category === selectedCategory;
    const titleText = vid.title[currentLanguage] || vid.title.en || '';
    const descText = vid.description[currentLanguage] || vid.description.en || '';
    const matchesQuery =
      searchQuery === '' ||
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
    const qText = faq.question[currentLanguage] || faq.question.en || '';
    const aText = faq.answer[currentLanguage] || faq.answer.en || '';
    const matchesQuery =
      searchQuery === '' ||
      qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handlePrintArticle = (article: EducationalArticle) => {
    const title = article.title[currentLanguage] || article.title.en;
    const content = (article.content[currentLanguage] || article.content.en || []).join('\n\n');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="${isRtl ? 'rtl' : 'ltr'}" lang="${currentLanguage}">
        <head>
          <title>${title} - +CareBridge Health</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 30px; line-height: 1.6; color: #1e293b; }
            h1 { color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }
            .badge { background: #f0fdf4; color: #166534; padding: 4px 10px; border-radius: 9999px; font-weight: bold; display: inline-block; margin-bottom: 15px; }
            p { margin-bottom: 12px; font-size: 16px; }
            .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <span class="badge">+CareBridge Educational Guide</span>
          <h1>${title}</h1>
          <div>${content.replace(/\n/g, '<br/>')}</div>
          <div class="footer">Printed from +CareBridge Post-Hospital Recovery System • Emergency Hotline: 997</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleShareWhatsApp = (title: string, summary: string) => {
    const text = encodeURIComponent(`*${title}*\n\n${summary}\n\nShared from +CareBridge Post-Hospital Recovery Care`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div id="educational-resources-container" className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-200 border border-emerald-400/30 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{getTranslation(currentLanguage, 'educationTitle')}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {getTranslation(currentLanguage, 'educationTitle')}
          </h2>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            {getTranslation(currentLanguage, 'educationSubtitle')}
          </p>
        </div>
        <div className="absolute top-1/2 -right-12 -translate-y-1/2 opacity-10 pointer-events-none">
          <BookOpen className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Search & Navigation Control Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Section Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-sm font-medium">
            <button
              id="tab-btn-articles"
              onClick={() => setActiveTab('articles')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'articles'
                  ? 'bg-white text-teal-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>{getTranslation(currentLanguage, 'articlesTab')}</span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200/50">
                {articles.length}
              </span>
            </button>

            <button
              id="tab-btn-videos"
              onClick={() => setActiveTab('videos')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-teal-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-4 h-4 text-cyan-600" />
              <span>{getTranslation(currentLanguage, 'videosTab')}</span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold border border-cyan-200/50">
                {videos.length}
              </span>
            </button>

            <button
              id="tab-btn-faqs"
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'faqs'
                  ? 'bg-white text-teal-800 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{getTranslation(currentLanguage, 'faqsTab')}</span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/50">
                {faqs.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
            <input
              id="education-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getTranslation(currentLanguage, 'educationTitle')}
              className={`w-full py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRtl ? 'left-3' : 'right-3'}`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-filter-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-700/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {renderCategoryIcon(cat)}
                <span>{getCategoryLabel(cat)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT 1: ARTICLES */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-sm">No articles found matching your filter criteria.</p>
            </div>
          ) : (
            filteredArticles.map((art) => {
              const isExpanded = expandedArticleId === art.id;
              const title = art.title[currentLanguage] || art.title.en;
              const summary = art.summary[currentLanguage] || art.summary.en;
              const contentLines = art.content[currentLanguage] || art.content.en || [];
              const takeaways = art.keyTakeaways[currentLanguage] || art.keyTakeaways.en || [];

              return (
                <div
                  key={art.id}
                  id={`article-card-${art.id}`}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded ? 'border-teal-500 shadow-md ring-1 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {/* Article Card Header */}
                  <div
                    onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                    className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 mt-0.5 shrink-0">
                        {renderCategoryIcon(art.category)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100/70 text-teal-800 border border-teal-200/60">
                            {getCategoryLabel(art.category)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{art.readTimeMinutes} min read</span>
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug hover:text-teal-700 transition">
                          {title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{summary}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-5">
                      {/* Detailed Content Lines */}
                      <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed shadow-2xs">
                        <h4 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-2">
                          <FileText className="w-4 h-4 text-teal-600" />
                          <span>Detailed Medical Step-by-Step Instructions</span>
                        </h4>
                        {contentLines.map((line, idx) => (
                          <p key={idx} className="text-slate-700 leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>

                      {/* Key Takeaways */}
                      {takeaways.length > 0 && (
                        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 space-y-2">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Key Takeaways & Reminders</span>
                          </h5>
                          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                            {takeaways.map((takeaway, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-xs font-semibold text-emerald-900 bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span>{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => handlePrintArticle(art)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Guide</span>
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(title, summary)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share via WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT 2: VIDEOS */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredVideos.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <Film className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-sm">No video guides found.</p>
            </div>
          ) : (
            filteredVideos.map((vid) => {
              const title = vid.title[currentLanguage] || vid.title.en;
              const desc = vid.description[currentLanguage] || vid.description.en;
              const chapters = vid.chapters[currentLanguage] || vid.chapters.en || [];

              return (
                <div
                  key={vid.id}
                  id={`video-card-${vid.id}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail Banner */}
                  <div className={`relative h-48 bg-gradient-to-br ${vid.thumbnailBg} p-5 flex flex-col justify-between text-white`}>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                        {getCategoryLabel(vid.category)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                        <Clock className="w-3 h-3 text-cyan-300" />
                        <span>{vid.duration}</span>
                      </span>
                    </div>

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => setActiveVideoModal(vid)}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 hover:bg-white text-teal-800 shadow-xl flex items-center justify-center transition-transform transform hover:scale-110 active:scale-95"
                    >
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </button>

                    <div className="relative z-10">
                      <h4 className="font-bold text-base line-clamp-1 drop-shadow-sm">{title}</h4>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{desc}</p>

                    {/* Chapter Timestamps */}
                    {chapters.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chapters</span>
                        <div className="space-y-1">
                          {chapters.slice(0, 3).map((ch, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveVideoModal(vid)}
                              className="w-full flex items-center justify-between text-xs text-slate-700 hover:text-teal-700 p-1.5 rounded-lg hover:bg-slate-50 text-left transition"
                            >
                              <span className="truncate">{ch.title}</span>
                              <span className="font-mono text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 shrink-0">
                                {ch.time}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setActiveVideoModal(vid)}
                      className="w-full mt-2 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Full Video Guide ({vid.duration})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT 3: FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-sm">No FAQs found matching search.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const qText = faq.question[currentLanguage] || faq.question.en;
              const aText = faq.answer[currentLanguage] || faq.answer.en;

              return (
                <div
                  key={faq.id}
                  id={`faq-card-${faq.id}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 md:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900 text-base">{qText}</span>
                    </div>
                    <div className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-5 bg-slate-50/80 border-t border-slate-100 text-sm text-slate-700 leading-relaxed">
                      <p className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">{aText}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIDEO PLAYER MODAL OVERLAY */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800 space-y-4">
            {/* Modal Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base text-white truncate max-w-md">
                  {activeVideoModal.title[currentLanguage] || activeVideoModal.title.en}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <iframe
                src={activeVideoModal.videoUrlPlaceholder}
                title="Video Guide"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Details & Chapters in Modal */}
            <div className="p-5 space-y-3 bg-slate-900/90 max-h-48 overflow-y-auto">
              <p className="text-xs text-slate-300">
                {activeVideoModal.description[currentLanguage] || activeVideoModal.description.en}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
