"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Award, CheckCircle2, Download, Star } from "lucide-react";

function WatchCourseContent() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lectureIdFromUrl = searchParams.get("lecture");
  const videoRef = useRef(null);

  const [data, setData] = useState(null);
  const [current, setCurrent] = useState(null);
  const [currentLectureId, setCurrentLectureId] = useState(null);
  const [video, setVideo] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [completedLectures, setCompletedLectures] = useState({});
  const [savingLectureId, setSavingLectureId] = useState(null);
  const [courseProgress, setCourseProgress] = useState({
    completedLecturesCount: 0,
    totalLectures: 0,
    isCompleted: false,
    certificateIssuedAt: null,
    certificateId: null,
  });
  const [lectureRatings, setLectureRatings] = useState({});
  const [lectureRatingMeta, setLectureRatingMeta] = useState({});
  const [ratingLoadingId, setRatingLoadingId] = useState(null);
  const [ratingSavingId, setRatingSavingId] = useState(null);
  const [courseFeedback, setCourseFeedback] = useState("");
  const [feedbackSavedAt, setFeedbackSavedAt] = useState(null);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  const toggleLectureCompletion = async (lectureId) => {
    const previousValue = !!completedLectures[lectureId];
    if (previousValue) {
      return;
    }

    const nextCompleted = !previousValue;

    setCompletedLectures((prev) => ({
      ...prev,
      [lectureId]: nextCompleted,
    }));
    setSavingLectureId(lectureId);

    try {
      const res = await fetch(`/api/courses/${slug}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lectureId,
          completed: nextCompleted,
        }),
      });

      const progressData = await res.json();

      if (!res.ok) {
        throw new Error(progressData.message || "Failed to save progress");
      }

      const completedMap = Object.fromEntries(
        (progressData.completedLectureIds || []).map((id) => [id, true]),
      );
      setCompletedLectures(completedMap);
      setCourseProgress({
        completedLecturesCount: progressData.completedLecturesCount || 0,
        totalLectures: progressData.totalLectures || 0,
        isCompleted: !!progressData.isCompleted,
        certificateIssuedAt: progressData.certificateIssuedAt || null,
        certificateId: progressData.certificateId || null,
      });
    } catch (error) {
      console.error("Failed to update lecture completion:", error);
      setCompletedLectures((prev) => ({
        ...prev,
        [lectureId]: previousValue,
      }));
      alert("Could not save lecture progress. Please try again.");
    } finally {
      setSavingLectureId(null);
    }
  };

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const getLecturesForSection = (sectionId) => {
    if (!data?.lectures) return [];
    return data.lectures
      .filter((lec) => lec.sectionId === sectionId)
      .sort((a, b) => a.order - b.order);
  };

  const getOrderedSections = () => {
    if (!data?.sections) return [];
    return [...data.sections].sort((a, b) => a.order - b.order);
  };

  const getAdjacentLecture = (direction) => {
    if (!data?.sections?.length || !currentLectureId) return null;

    const orderedSections = getOrderedSections();
    const currentLecture = data.lectures?.find(
      (lecture) => lecture._id === currentLectureId,
    );

    if (!currentLecture) return null;

    const currentSectionLectures = getLecturesForSection(currentLecture.sectionId);
    const currentLectureIndex = currentSectionLectures.findIndex(
      (lecture) => lecture._id === currentLectureId,
    );

    if (currentLectureIndex === -1) return null;

    if (direction === "next") {
      const nextLectureInSection = currentSectionLectures[currentLectureIndex + 1];

      if (nextLectureInSection) {
        return nextLectureInSection;
      }
    }

    if (direction === "previous") {
      const previousLectureInSection =
        currentSectionLectures[currentLectureIndex - 1];

      if (previousLectureInSection) {
        return previousLectureInSection;
      }
    }

    const currentSectionIndex = getOrderedSections().findIndex(
      (section) => section._id === currentLecture.sectionId,
    );

    if (currentSectionIndex === -1) return null;

    const targetSection =
      direction === "next"
        ? orderedSections[currentSectionIndex + 1]
        : orderedSections[currentSectionIndex - 1];

    if (!targetSection) return null;

    const targetSectionLectures = getLecturesForSection(targetSection._id);

    if (!targetSectionLectures.length) return null;

    return direction === "next"
      ? targetSectionLectures[0]
      : targetSectionLectures[targetSectionLectures.length - 1];
  };

  const playLecture = async (id) => {
    setLoadingVideo(true);

    const res = await fetch(`/api/lectures/${id}`);
    const lectureData = await res.json();

    if (!res.ok) {
      setLoadingVideo(false);
      alert(lectureData.message);
      return;
    }

    setVideo(lectureData.videoUrl);
    setCurrent(lectureData.title);
    setCurrentLectureId(id);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("lecture", id);
    router.replace(`/courses/${slug}/watch?${nextParams.toString()}`, {
      scroll: false,
    });
  };

  const loadLectureRating = async (lectureId) => {
    if (!lectureId) return;

    setRatingLoadingId(lectureId);

    try {
      const res = await fetch(`/api/lectures/${lectureId}/rating`);
      const ratingData = await res.json();

      if (!res.ok) {
        throw new Error(ratingData.message || "Failed to load rating");
      }

      setLectureRatings((prev) => ({
        ...prev,
        [lectureId]: ratingData.rating || 0,
      }));
      setLectureRatingMeta((prev) => ({
        ...prev,
        [lectureId]: {
          averageRating: ratingData.averageRating || 0,
          ratingCount: ratingData.ratingCount || 0,
        },
      }));
    } catch (error) {
      console.error("Failed to load lecture rating:", error);
    } finally {
      setRatingLoadingId(null);
    }
  };

  const saveLectureRating = async (lectureId, rating) => {
    if (!lectureId || !rating) return;

    const previous = lectureRatings[lectureId] || 0;
    setLectureRatings((prev) => ({
      ...prev,
      [lectureId]: rating,
    }));
    setRatingSavingId(lectureId);

    try {
      const res = await fetch(`/api/lectures/${lectureId}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });

      const ratingData = await res.json();

      if (!res.ok) {
        throw new Error(ratingData.message || "Failed to save rating");
      }
    } catch (error) {
      console.error("Failed to save lecture rating:", error);
      setLectureRatings((prev) => ({
        ...prev,
        [lectureId]: previous,
      }));
      alert("Could not save your rating. Please try again.");
    } finally {
      setRatingSavingId(null);
    }
  };

  useEffect(() => {
    fetch(`/api/courses/${slug}/access`)
      .then((res) => res.json())
      .then((accessData) => {
        if (!accessData.access) {
          router.push(`/courses/${slug}`);
        }
      });
  }, [router, slug]);

  useEffect(() => {
    fetch(`/api/courses/${slug}`)
      .then((res) => res.json())
      .then(setData);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/courses/${slug}/feedback`)
      .then(async (res) => {
        const feedbackData = await res.json();

        if (!res.ok) {
          throw new Error(feedbackData.message || "Failed to load feedback");
        }

        return feedbackData;
      })
      .then((feedbackData) => {
        setCourseFeedback(feedbackData.feedback || "");
        setFeedbackSavedAt(feedbackData.updatedAt || null);
      })
      .catch((error) => {
        console.error("Failed to load course feedback:", error);
      });
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/courses/${slug}/progress`)
      .then(async (res) => {
        const progressData = await res.json();

        if (!res.ok) {
          throw new Error(progressData.message || "Failed to load progress");
        }

        return progressData;
      })
      .then((progressData) => {
        const completedMap = Object.fromEntries(
          (progressData.completedLectureIds || []).map((id) => [id, true]),
        );
        setCompletedLectures(completedMap);
        setCourseProgress({
          completedLecturesCount: progressData.completedLecturesCount || 0,
          totalLectures: progressData.totalLectures || 0,
          isCompleted: !!progressData.isCompleted,
          certificateIssuedAt: progressData.certificateIssuedAt || null,
          certificateId: progressData.certificateId || null,
        });
      })
      .catch((error) => {
        console.error("Failed to load lecture progress:", error);
        setCompletedLectures({});
        setCourseProgress({
          completedLecturesCount: 0,
          totalLectures: 0,
          isCompleted: false,
          certificateIssuedAt: null,
          certificateId: null,
        });
      });
  }, [slug]);

  useEffect(() => {
    if (!data?.sections?.length) return;

    const firstSectionWithLecture = getOrderedSections().find(
      (section) => getLecturesForSection(section._id).length > 0,
    );
    const firstLectureId =
      firstSectionWithLecture &&
      getLecturesForSection(firstSectionWithLecture._id)[0]?._id;

    const targetLectureId = lectureIdFromUrl || firstLectureId || null;

    if (!targetLectureId) return;

    const targetLecture = data.lectures?.find(
      (lecture) => lecture._id === targetLectureId,
    );

    if (targetLecture?.sectionId) {
      setOpenSection(targetLecture.sectionId);
    }

    playLecture(targetLectureId);
  }, [data, lectureIdFromUrl]);

  useEffect(() => {
    if (!currentLectureId) return;
    loadLectureRating(currentLectureId);
  }, [currentLectureId]);

  useEffect(() => {
    if (!videoRef.current || !video) return;

    const attemptAutoplay = async () => {
      try {
        videoRef.current.currentTime = 0;
        await videoRef.current.play();
      } catch (error) {
        console.error("Autoplay failed:", error);
      } finally {
        setLoadingVideo(false);
      }
    };

    attemptAutoplay();
  }, [video]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.min(
          videoRef.current.currentTime + 5,
          videoRef.current.duration || videoRef.current.currentTime + 5,
        );
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(
          videoRef.current.currentTime - 5,
          0,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const playNextLecture = () => {
    const nextLecture = getAdjacentLecture("next");

    if (!nextLecture) return;

    setOpenSection(nextLecture.sectionId);
    playLecture(nextLecture._id);
  };

  const playPreviousLecture = () => {
    const previousLecture = getAdjacentLecture("previous");

    if (!previousLecture) return;

    setOpenSection(previousLecture.sectionId);
    playLecture(previousLecture._id);
  };

  const nextLecture = getAdjacentLecture("next");
  const previousLecture = getAdjacentLecture("previous");
  const completionPercentage = courseProgress.totalLectures
    ? Math.min(
        100,
        Math.round(
          (courseProgress.completedLecturesCount / courseProgress.totalLectures) * 100,
        ),
      )
    : 0;
  const isCertificateReady = courseProgress.isCompleted;
  const currentLectureRating = currentLectureId
    ? lectureRatings[currentLectureId] || 0
    : 0;
  const currentLectureMeta = currentLectureId
    ? lectureRatingMeta[currentLectureId]
    : null;

  return (
    <div className="grid min-h-screen md:grid-cols-4">
      <div className="border-r p-4">
        <h1 className="mb-3 text-3xl font-bold">Lectures</h1>
        <div className="space-y-4">
          {data?.sections?.map((section) => {
            const sectionLectures = getLecturesForSection(section._id);
            const isOpen = openSection === section._id;

            return (
              <div
                key={section._id}
                className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <button
                  onClick={() => toggleSection(section._id)}
                  className="flex w-full items-center justify-between bg-slate-100 px-4 py-3 font-bold dark:bg-slate-800"
                >
                  {section.order}. {section.title}
                  <span>{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <ul className="divide-y divide-slate-200 dark:divide-slate-800 ">
                    {sectionLectures?.map((lec) => (
                      <li
                        key={lec._id}
                        onClick={() => playLecture(lec._id)}
                        className="flex cursor-pointer items-center justify-between px-4 py-3 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!!completedLectures[lec._id]}
                            onChange={(event) => {
                              event.stopPropagation();
                              toggleLectureCompletion(lec._id);
                            }}
                            onClick={(event) => event.stopPropagation()}
                            aria-label={`Mark ${lec.title} as completed`}
                            disabled={savingLectureId === lec._id || !!completedLectures[lec._id]}
                            className="h-4 w-4 cursor-pointer accent-green-600 disabled:cursor-not-allowed"
                          />
                          <span
                            className={`text-left font-medium hover:underline ${
                              completedLectures[lec._id]
                                ? "text-slate-500 line-through dark:text-slate-400"
                                : ""
                            }`}
                          >
                            {lec.order}. {lec.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {completedLectures[lec._id] && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                              Completed
                            </span>
                          )}
                          {lec.isPreview && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                              Preview
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:col-span-3">
        {video ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-xl font-bold">{current}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                    isCertificateReady
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100"
                      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isCertificateReady
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {isCertificateReady ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Award className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {completionPercentage}% completed
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {courseProgress.completedLecturesCount}/
                      {courseProgress.totalLectures} lectures
                    </p>
                  </div>

                  {isCertificateReady ? (
                    <a
                      href={`/api/courses/${slug}/certificate`}
                      download
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    >
                      <Download className="h-4 w-4" />
                      Locked
                    </button>
                  )}
                </div>

                {currentLectureId && (
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={!!completedLectures[currentLectureId]}
                      onChange={() => toggleLectureCompletion(currentLectureId)}
                      disabled={
                        savingLectureId === currentLectureId ||
                        !!completedLectures[currentLectureId]
                      }
                      className="h-4 w-4 cursor-pointer accent-green-600 disabled:cursor-not-allowed"
                    />
                    Mark as completed
                  </label>
                )}
              </div>
            </div>
            <video
              ref={videoRef}
              key={video}
              src={video}
              controls
              autoPlay
              playsInline
              preload="auto"
              onEnded={playNextLecture}
              className="w-full rounded"
            />
            {currentLectureId && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Rate this lecture
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Your rating helps improve the course.
                    </p>
                  </div>
                  {currentLectureMeta && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Avg {currentLectureMeta.averageRating.toFixed(1)} (
                      {currentLectureMeta.ratingCount})
                    </p>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isActive = value <= currentLectureRating;
                    const isBusy =
                      ratingLoadingId === currentLectureId ||
                      ratingSavingId === currentLectureId;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => saveLectureRating(currentLectureId, value)}
                        disabled={isBusy}
                        className={`rounded-full p-1 transition ${
                          isBusy ? "cursor-not-allowed opacity-70" : "hover:scale-105"
                        }`}
                        aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            isActive
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                  {(ratingLoadingId === currentLectureId ||
                    ratingSavingId === currentLectureId) && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Saving...
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={playPreviousLecture}
                disabled={!previousLecture}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Previous Video
              </button>
              <button
                type="button"
                onClick={playNextLecture}
                disabled={!nextLecture}
                className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                Next Video
              </button>
            </div>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Course Feedback
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Share what you liked or what we can improve.
                  </p>
                </div>
                {feedbackSavedAt && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Last updated {new Date(feedbackSavedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <textarea
                value={courseFeedback}
                onChange={(event) => setCourseFeedback(event.target.value)}
                placeholder="Write your feedback..."
                rows={4}
                className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    const trimmed = courseFeedback.trim();
                    if (trimmed.length < 3) {
                      alert("Please enter at least 3 characters of feedback.");
                      return;
                    }
                    setFeedbackSaving(true);

                    try {
                      const res = await fetch(`/api/courses/${slug}/feedback`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ feedback: trimmed }),
                      });
                      const feedbackData = await res.json();

                      if (!res.ok) {
                        throw new Error(
                          feedbackData.message || "Failed to save feedback",
                        );
                      }

                      setCourseFeedback(feedbackData.feedback || trimmed);
                      setFeedbackSavedAt(feedbackData.updatedAt || new Date().toISOString());
                    } catch (error) {
                      console.error("Failed to save feedback:", error);
                      alert("Could not save feedback. Please try again.");
                    } finally {
                      setFeedbackSaving(false);
                    }
                  }}
                  disabled={feedbackSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {feedbackSaving ? "Saving..." : "Save feedback"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>{loadingVideo ? "Loading..." : "Select a lecture to start"}</p>
        )}
      </div>
    </div>
  );
}

export default function WatchCourse() {
  return (
    <Suspense fallback={null}>
      <WatchCourseContent />
    </Suspense>
  );
}
