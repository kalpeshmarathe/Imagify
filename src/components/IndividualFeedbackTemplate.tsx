"use client";

/** Single feedback card for sharing – modern layout with picpop branding */
export function IndividualFeedbackTemplate({
  feedbackImageUrl,
  coolId,
}: {
  feedbackImageUrl: string;
  coolId: string;
}) {
  return (
    <div
      data-share-template
      style={{
        width: 375,
        height: 667,
        background: "linear-gradient(165deg, #0a0a0a 0%, #15152a 50%, #0d0d1a 100%)",
        borderRadius: 24,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', sans-serif",
        padding: 28,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        style={{
          flex: 1,
          borderRadius: 20,
          overflow: "hidden",
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={feedbackImageUrl}
          alt=""
          crossOrigin="anonymous"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "0.15em",
            background: "linear-gradient(135deg, #FF3D7F, #7C3AFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          picpop
        </p>
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          anonymous feedback q&a
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
          @{coolId}
        </p>
      </div>
    </div>
  );
}
