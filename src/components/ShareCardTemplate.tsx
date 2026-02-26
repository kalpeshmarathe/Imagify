"use client";

/** Story-sized card (9:16) for sharing to Instagram/WhatsApp */
export function ShareCardTemplate({
  imageUrl,
  coolId,
  feedbackImageUrls = [],
  shareUrl,
}: {
  imageUrl: string;
  coolId: string;
  feedbackImageUrls?: string[];
  shareUrl: string;
}) {
  return (
    <div
      data-share-template
      style={{
        width: 375,
        height: 667,
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)",
        borderRadius: 24,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', sans-serif",
        padding: 24,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF3D7F, #7C3AFF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 18,
            color: "#fff",
          }}
        >
          {(coolId || "?")[0].toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#fff" }}>@{coolId}</p>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>picpop</p>
        </div>
      </div>

      {/* Main image */}
      <div
        style={{
          flex: 1,
          borderRadius: 16,
          overflow: "hidden",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 280,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Reactions strip */}
      {feedbackImageUrls.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            reactions
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {feedbackImageUrls.slice(0, 6).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                crossOrigin="anonymous"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Branding footer */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "0.12em",
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
            margin: "6px 0 0 0",
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          anonymous feedback q&a
        </p>
        <p style={{ margin: "6px 0 0 0", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
          {shareUrl}
        </p>
      </div>
    </div>
  );
}
