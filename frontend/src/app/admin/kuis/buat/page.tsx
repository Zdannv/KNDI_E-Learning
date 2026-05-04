"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import { Plus, Save, Trash2, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Music, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";

import { QuestionType, QuestionBase, MultipleChoiceQuestion, ShortAnswerQuestion, Question, QuizData, fallbackMockQuizzes, MultipleChoiceOption, MatchingPair, MatchingContent } from "@/data/dummyKuis";

interface QuizFormState {
  title: string;
  questions: Question[];
}

function BuatKuisForm() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [formState, setFormState] = useState<QuizFormState>({
    title: "",
    questions: []
  });

  const [storedQuizzes, setStoredQuizzes, isClient] = useLocalStorage<QuizData[]>("kndi_quizzes_v2", fallbackMockQuizzes);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastSuccess, setToastSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hydrate form if edit parameter exists
  useEffect(() => {
    if (isClient && editId && storedQuizzes.length > 0) {
      const existingQuiz = storedQuizzes.find((q) => q.id === editId);
      if (existingQuiz) {
        setFormState({
          title: existingQuiz.title,
          questions: existingQuiz.questions,
        });
      }
    }
  }, [editId, isClient, storedQuizzes]);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleAddQuestion = () => {
    const newQuestion: MultipleChoiceQuestion = {
      id: generateId(),
      type: "multiple_choice",
      questionText: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctOptionIndex: 0,
    };
    
    setFormState(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setErrorMsg(null);
  };

  const handleRemoveQuestion = (id: string) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const handleQuestionChange = (id: string, updates: Partial<Question>) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === id) {
          return { ...q, ...updates } as Question;
        }
        return q;
      })
    }));
  };

  const handleTypeSwitch = (id: string, newType: QuestionType) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === id && q.type !== newType) {
          if (newType === "multiple_choice") {
            return {
              id: q.id,
              type: "multiple_choice",
              questionText: q.questionText,
              options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
              correctOptionIndex: 0,
              imageUrl: q.imageUrl,
              audioUrl: q.audioUrl
            };
          } else if (newType === "matching") {
            return {
              id: q.id,
              type: "matching",
              questionText: q.questionText,
              pairs: [
                { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } },
                { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } }
              ],
              imageUrl: q.imageUrl,
              audioUrl: q.audioUrl
            } as Question;
          } else {
            return {
              id: q.id,
              type: "short_answer",
              questionText: q.questionText,
              correctAnswerText: "",
              imageUrl: q.imageUrl,
              audioUrl: q.audioUrl
            } as Question;
          }
        }
        return q;
      })
    }));
  };

  const updateOptionField = (questionId: string, optionIndex: number, field: keyof MultipleChoiceOption, value: any) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === "multiple_choice") {
          const newOptions = [...q.options] as [MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption, MultipleChoiceOption];
          
          if (value === undefined) {
             const { [field]: _, ...rest } = newOptions[optionIndex];
             newOptions[optionIndex] = rest as MultipleChoiceOption;
          } else {
             newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
          }
          
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const updateMatchingPair = (questionId: string, pairId: string, side: 'leftContent' | 'rightContent', field: keyof MatchingContent, value: any) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === "matching") {
          const newPairs = q.pairs.map(p => {
            if (p.id === pairId) {
              const updatedSide = { ...p[side] };
              if (value === undefined) {
                delete (updatedSide as any)[field];
              } else {
                (updatedSide as any)[field] = value;
              }
              return { ...p, [side]: updatedSide };
            }
            return p;
          });
          return { ...q, pairs: newPairs };
        }
        return q;
      })
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
         setErrorMsg("Ukuran file media maksimal adalah 2MB agar browser tidak error.");
         e.target.value = '';
         return;
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        callback(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const addMatchingPair = (questionId: string) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === "matching") {
          if (q.pairs.length >= 5) return q;
          return {
            ...q,
            pairs: [...q.pairs, { id: generateId(), leftContent: { text: "" }, rightContent: { text: "" } }]
          };
        }
        return q;
      })
    }));
  };

  const removeMatchingPair = (questionId: string, pairId: string) => {
    setFormState(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === "matching") {
          return {
            ...q,
            pairs: q.pairs.filter(p => p.id !== pairId)
          };
        }
        return q;
      })
    }));
  };

  const validateForm = (): boolean => {
    if (formState.title.trim() === "") {
      setErrorMsg("Judul kuis tidak boleh kosong.");
      return false;
    }
    if (formState.questions.length === 0) {
      setErrorMsg("Kuis harus memiliki minimal 1 soal.");
      return false;
    }

    for (let i = 0; i < formState.questions.length; i++) {
      const q = formState.questions[i];
      if (q.questionText.trim() === "") {
        setErrorMsg(`Teks pertanyaan pada soal #${i + 1} tidak boleh kosong.`);
        return false;
      }
      
      if (q.type === "multiple_choice") {
        if (q.options.some(opt => opt.text.trim() === "")) {
          setErrorMsg(`Pilihan ganda pada soal #${i + 1} tidak boleh ada opsi yang kosong.`);
          return false;
        }
      } else if (q.type === "short_answer") {
        if (q.correctAnswerText.trim() === "") {
          setErrorMsg(`Kunci jawaban isian singkat pada soal #${i + 1} tidak boleh kosong.`);
          return false;
        }
      } else if (q.type === "matching") {
        if (q.pairs.length === 0) {
          setErrorMsg(`Soal menjodohkan #${i + 1} harus memiliki minimal 1 pasangan.`);
          return false;
        }
        for (const pair of q.pairs) {
          if (pair.leftContent.text.trim() === "" || pair.rightContent.text.trim() === "") {
            setErrorMsg(`Pasangan menjodohkan pada soal #${i + 1} tidak boleh ada opsi yang kosong (pasangan kiri dan kanan harus terisi).`);
            return false;
          }
        }
      }
    }

    setErrorMsg(null);
    return true;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      if (editId) {
        setStoredQuizzes(prev => prev.map(q => {
          if (q.id === editId) {
            return {
              ...q,
              title: formState.title,
              questions: formState.questions
            };
          }
          return q;
        }));
      } else {
        const newQuiz: QuizData = {
          id: "quiz-" + Date.now().toString(),
          title: formState.title,
          description: "Kuis bahasa Jepang dasar.", 
          questions: formState.questions
        };
        setStoredQuizzes(prev => [newQuiz, ...prev]);
        setFormState({ title: "", questions: [] });
      }

      setIsSubmitting(false);
      setToastSuccess(true);
      setTimeout(() => setToastSuccess(false), 4000);
      
    }, 1500);
  };

  if (!isClient) {
    return <div className="p-6 max-w-4xl mx-auto min-h-screen" />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          {editId ? "Editor Kuis" : "Buat Kuis Baru"}
        </h1>
        <p className="text-slate-600">
          {editId 
            ? "Perbarui struktur soal dan kunci jawaban dari kuis ini." 
            : "Buatlah kuis bahasa Jepang interaktif untuk menguji pemahaman pengguna."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
            Judul Kuis
          </label>
          <input
            type="text"
            id="title"
            value={formState.title}
            onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Contoh: Kuis Pemahaman Hiragana Dasar"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {formState.questions.length > 0 && (
          <div className="space-y-6">
            {formState.questions.map((q, index) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all hover:border-blue-200">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-slate-800 bg-blue-50 text-blue-700 px-3 py-1 rounded-md">
                    Soal #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    disabled={isSubmitting}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label className="block text-sm font-semibold text-slate-700">Teks Pertanyaan</label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleQuestionChange(q.id, { imageUrl: q.imageUrl === undefined ? "" : undefined })}
                          className={`flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${q.imageUrl !== undefined ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                          {q.imageUrl !== undefined ? 'Hapus Gambar' : 'Gambar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuestionChange(q.id, { audioUrl: q.audioUrl === undefined ? "" : undefined })}
                          className={`flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${q.audioUrl !== undefined ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          <Music className="w-3.5 h-3.5 mr-1.5" />
                          {q.audioUrl !== undefined ? 'Hapus Audio' : 'Audio'}
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(q.id, { questionText: e.target.value })}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none"
                      placeholder="Masukkan pertanyaan di sini..."
                    />

                    {/* Media Inputs for Question */}
                    <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-1">
                      {q.imageUrl !== undefined && (
                        <div className="flex gap-4 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gambar Pertanyaan (Opsional)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, (base64) => handleQuestionChange(q.id, { imageUrl: base64 }))}
                              className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                          </div>
                          {q.imageUrl && (
                            <img src={q.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md border border-slate-200 bg-white" onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=Error')} />
                          )}
                        </div>
                      )}

                      {q.audioUrl !== undefined && (
                        <div className="flex flex-col space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audio Pertanyaan (Opsional)</label>
                           <div className="flex flex-col xl:flex-row gap-3 xl:items-center">
                             <input
                               type="file"
                               accept="audio/*"
                               onChange={(e) => handleFileUpload(e, (base64) => handleQuestionChange(q.id, { audioUrl: base64 }))}
                               className="flex-1 text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                             />
                             {q.audioUrl && (
                               <audio controls src={q.audioUrl} className="h-10 w-full xl:w-64" />
                             )}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Tipe Soal</label>
                    <div className="relative">
                      <select
                        value={q.type}
                        onChange={(e) => handleTypeSwitch(q.id, e.target.value as QuestionType)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="multiple_choice">Pilihan Ganda</option>
                        <option value="short_answer">Isian Singkat</option>
                        <option value="matching">Menjodohkan (Matching)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditional Rendering Options */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                  {q.type === "matching" ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-700">Pasangan Jawaban (Maks 5 Baris)</label>
                        <button
                          type="button"
                          onClick={() => addMatchingPair(q.id)}
                          disabled={isSubmitting || q.pairs.length >= 5}
                          className="flex items-center px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-100"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Pasangan
                        </button>
                      </div>

                      <div className="space-y-4">
                        {q.pairs.map((pair) => (
                          <div key={pair.id} className="relative bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
                            {/* Left Side */}
                            <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kiri (Pertanyaan)</span>
                                <div className="flex space-x-1">
                                  <button type="button" onClick={() => updateMatchingPair(q.id, pair.id, 'leftContent', 'imageUrl', pair.leftContent.imageUrl !== undefined ? undefined : "")} className={`p-1.5 rounded transition-colors ${pair.leftContent.imageUrl !== undefined ? 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'}`} title="Tambahkan/Hapus Gambar Kiri"><ImageIcon className="w-3.5 h-3.5" /></button>
                                  <button type="button" onClick={() => updateMatchingPair(q.id, pair.id, 'leftContent', 'audioUrl', pair.leftContent.audioUrl !== undefined ? undefined : "")} className={`p-1.5 rounded transition-colors ${pair.leftContent.audioUrl !== undefined ? 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'}`} title="Tambahkan/Hapus Audio Kiri"><Music className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                              <input type="text" value={pair.leftContent.text} onChange={(e) => updateMatchingPair(q.id, pair.id, 'leftContent', 'text', e.target.value)} disabled={isSubmitting} placeholder="Ketik teks kiri..." className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 rounded-md px-3 py-2 text-sm" />
                              {(pair.leftContent.imageUrl !== undefined || pair.leftContent.audioUrl !== undefined) && (
                                <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
                                  {pair.leftContent.imageUrl !== undefined && (
                                    <div className="flex gap-2">
                                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (base64) => updateMatchingPair(q.id, pair.id, 'leftContent', 'imageUrl', base64))} className="flex-1 w-full text-xs px-2 py-1.5 rounded bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                      {pair.leftContent.imageUrl && <img src={pair.leftContent.imageUrl} alt="Kiri" className="w-8 h-8 rounded shrink-0 object-cover border border-slate-200" onError={(e)=>(e.currentTarget.src='https://placehold.co/32x32?text=!')} />}
                                    </div>
                                  )}
                                  {pair.leftContent.audioUrl !== undefined && (
                                    <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, (base64) => updateMatchingPair(q.id, pair.id, 'leftContent', 'audioUrl', base64))} className="w-full text-xs px-2 py-1.5 rounded bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Connector */}
                            <div className="shrink-0 flex items-center justify-center p-2 rounded-full bg-indigo-50 text-indigo-500 shadow-sm border border-indigo-100">
                              <ArrowRight className="w-5 h-5 md:rotate-0 rotate-90" />
                            </div>

                            {/* Right Side */}
                            <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kanan (Jawaban)</span>
                                <div className="flex space-x-1">
                                  <button type="button" onClick={() => updateMatchingPair(q.id, pair.id, 'rightContent', 'imageUrl', pair.rightContent.imageUrl !== undefined ? undefined : "")} className={`p-1.5 rounded transition-colors ${pair.rightContent.imageUrl !== undefined ? 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'}`} title="Tambahkan/Hapus Gambar Kanan"><ImageIcon className="w-3.5 h-3.5" /></button>
                                  <button type="button" onClick={() => updateMatchingPair(q.id, pair.id, 'rightContent', 'audioUrl', pair.rightContent.audioUrl !== undefined ? undefined : "")} className={`p-1.5 rounded transition-colors ${pair.rightContent.audioUrl !== undefined ? 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'}`} title="Tambahkan/Hapus Audio Kanan"><Music className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                              <input type="text" value={pair.rightContent.text} onChange={(e) => updateMatchingPair(q.id, pair.id, 'rightContent', 'text', e.target.value)} disabled={isSubmitting} placeholder="Ketik teks kanan..." className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 rounded-md px-3 py-2 text-sm" />
                              {(pair.rightContent.imageUrl !== undefined || pair.rightContent.audioUrl !== undefined) && (
                                <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
                                  {pair.rightContent.imageUrl !== undefined && (
                                    <div className="flex gap-2">
                                       <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (base64) => updateMatchingPair(q.id, pair.id, 'rightContent', 'imageUrl', base64))} className="flex-1 w-full text-xs px-2 py-1.5 rounded bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                       {pair.rightContent.imageUrl && <img src={pair.rightContent.imageUrl} alt="Kanan" className="w-8 h-8 rounded shrink-0 object-cover border border-slate-200" onError={(e)=>(e.currentTarget.src='https://placehold.co/32x32?text=!')}/>}
                                    </div>
                                  )}
                                  {pair.rightContent.audioUrl !== undefined && (
                                    <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, (base64) => updateMatchingPair(q.id, pair.id, 'rightContent', 'audioUrl', base64))} className="w-full text-xs px-2 py-1.5 rounded bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Delete Pair Button */}
                            <button
                              type="button"
                              onClick={() => removeMatchingPair(q.id, pair.id)}
                              disabled={isSubmitting || q.pairs.length <= 1}
                              className="absolute -top-3 -right-3 md:top-auto md:bottom-auto md:relative lg:absolute lg:-top-3 lg:-right-3 p-2 bg-white border border-red-200 text-red-500 rounded-full hover:bg-red-50 hover:text-red-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Hapus Pasangan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : q.type === "multiple_choice" ? (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Pilihan Ganda (Tandai yang benar)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex flex-col space-y-2">
                            <div 
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all 
                                ${q.correctOptionIndex === optIndex ? 'border-blue-500 bg-white ring-1 ring-blue-500 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                            >
                              <input
                                type="radio"
                                name={`correct-opt-${q.id}`}
                                checked={q.correctOptionIndex === optIndex}
                                onChange={() => handleQuestionChange(q.id, { correctOptionIndex: optIndex })}
                                disabled={isSubmitting}
                                className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="flex-1 font-semibold text-slate-600 shrink-0 select-none pb-0.5 w-6 uppercase">
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => updateOptionField(q.id, optIndex, "text", e.target.value)}
                                disabled={isSubmitting}
                                placeholder={`Opsi ${String.fromCharCode(65 + optIndex)}...`}
                                className="w-full bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => updateOptionField(q.id, optIndex, "imageUrl", opt.imageUrl !== undefined ? undefined : "")}
                                disabled={isSubmitting}
                                className={`p-1.5 rounded-md transition-colors shrink-0 ${opt.imageUrl !== undefined ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                                title="Tambahkan/Hapus Gambar Opsi"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateOptionField(q.id, optIndex, "audioUrl", opt.audioUrl !== undefined ? undefined : "")}
                                disabled={isSubmitting}
                                className={`p-1.5 rounded-md transition-colors shrink-0 ${opt.audioUrl !== undefined ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                                title="Tambahkan/Hapus Audio Opsi"
                              >
                                <Music className="w-4 h-4" />
                              </button>
                            </div>

                            {opt.imageUrl !== undefined && (
                              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-2 ml-10 space-x-3 mt-1 animate-in fade-in slide-in-from-top-1">
                                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, (base64) => updateOptionField(q.id, optIndex, "imageUrl", base64))}
                                  disabled={isSubmitting}
                                  className="flex-1 w-full text-xs px-2 py-1.5 focus:outline-none bg-white border border-slate-200 rounded-md cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {opt.imageUrl && (
                                  <img src={opt.imageUrl} alt="Thumb" className="w-8 h-8 object-cover rounded border border-slate-200 bg-white shrink-0" onError={(e) => (e.currentTarget.src = 'https://placehold.co/32x32?text=!')}/>
                                )}
                              </div>
                            )}
                            {opt.audioUrl !== undefined && (
                              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-2 ml-10 space-x-3 mt-1 animate-in fade-in slide-in-from-top-1">
                                <Music className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                                <input
                                  type="file"
                                  accept="audio/*"
                                  onChange={(e) => handleFileUpload(e, (base64) => updateOptionField(q.id, optIndex, "audioUrl", base64))}
                                  disabled={isSubmitting}
                                  className="flex-1 w-full text-xs px-2 py-1.5 focus:outline-none bg-white border border-slate-200 rounded-md cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {opt.audioUrl && <audio controls src={opt.audioUrl} className="h-8 w-full" />}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Kunci Jawaban</label>
                      <input
                        type="text"
                        value={q.correctAnswerText}
                        onChange={(e) => handleQuestionChange(q.id, { correctAnswerText: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                        placeholder="Ketik jawaban yang tepat di sini..."
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Global Error */}
        {errorMsg && (
          <div className="flex items-start bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl transition-all shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 sm:space-y-0">
          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex flex-row justify-center items-center px-5 py-3 text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-95 font-semibold rounded-lg transition-all border border-blue-100 hover:border-blue-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span>Tambah Soal</span>
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto flex flex-row justify-center items-center px-8 py-3 text-white font-semibold rounded-lg transition-all shadow-sm
              ${isSubmitting 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:scale-95'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                <span>{editId ? "Perbarui Kuis" : "Simpan Kuis"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Toast */}
      {toastSuccess && (
        <div className="fixed bottom-8 right-8 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
          <div className="bg-slate-800 shadow-xl border border-slate-700 rounded-xl px-5 py-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="font-medium text-sm text-white">
              {editId ? "Kuis berhasil diperbarui!" : "Kuis berhasil disimpan!"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuatKuisPage() {
  return (
    <Suspense fallback={<div className="p-6 max-w-4xl mx-auto h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <BuatKuisForm />
    </Suspense>
  );
}
