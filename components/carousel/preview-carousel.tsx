/* eslint-disable @next/next/no-img-element */
import React from "react";

interface Props {
  preview: string[];
}

const PreviewCarousel: React.FC<Props> = ({ preview }) => {
  return (
    <>
      <div className="carousel w-full aspect-square">
        {preview.map((srcUrl, index) => {
          const slideIndex = index + 1;
          return (
            <div
              key={slideIndex}
              id={`item${slideIndex}`}
              className="carousel-item relative w-full"
            >
              <img
                src={srcUrl}
                className="w-full"
                alt={`previewImage${slideIndex}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex w-full justify-center gap-2 py-2">
        {preview.map((_, index) => (
          <a key={index + 1} href={`#item${index + 1}`} className="btn btn-sm">
            {index + 1}
          </a>
        ))}
      </div>
    </>
  );
};

export default PreviewCarousel;
