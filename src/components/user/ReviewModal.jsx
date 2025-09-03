"use client"

import { useState, useEffect } from "react"
import "../../styles/ReviewModal.css"

const ReviewModal = ({ isOpen, onClose, item, onSubmit, existingReview }) => {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [imageFiles, setImageFiles] = useState([])
    const [imagePreviews, setImagePreviews] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    // Cleanup function when component unmounts
    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url)
                }
            })
        }
    }, [imagePreviews])

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating || 0)
            setComment(existingReview.comment || "")
            setImageFiles([])

            const imageUrls = existingReview.imageUrls || []
            const processedUrls = imageUrls.map((url) => {
                if (url.startsWith("http")) {
                    return url
                }
                return `http://localhost:8080${url.startsWith("/") ? "" : "/"}${url}`
            })

            setImagePreviews(processedUrls)
        } else {
            // Reset form for new review
            setRating(0)
            setComment("")
            setImageFiles([])
            setImagePreviews([])
        }
        setSubmitError(null)
    }, [isOpen, existingReview])

    if (!isOpen) return null

    const isViewMode = !!existingReview

    const handleStarClick = (star) => {
        if (!isViewMode) {
            setRating(star)
        }
    }

    const handleFileChange = (e) => {
        if (isViewMode) return

        const files = Array.from(e.target.files)
        if (files.length + imageFiles.length > 5) {
            setSubmitError("Bạn chỉ có thể tải lên tối đa 5 ảnh.")
            return
        }

        const validFiles = []
        const newPreviews = []

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                setSubmitError(`File "${file.name}" quá lớn. Kích thước tối đa là 10MB.`)
                return
            }

            if (!file.type.startsWith("image/")) {
                setSubmitError(`File "${file.name}" không phải là ảnh hợp lệ.`)
                return
            }

            validFiles.push(file)
            newPreviews.push(URL.createObjectURL(file))
        }

        setImageFiles((prevFiles) => [...prevFiles, ...validFiles])
        setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews])
        setSubmitError(null)

        e.target.value = ""
    }

    const handleRemoveImage = (indexToRemove) => {
        if (isViewMode) return

        const urlToRevoke = imagePreviews[indexToRemove]
        if (urlToRevoke && urlToRevoke.startsWith("blob:")) {
            URL.revokeObjectURL(urlToRevoke)
        }

        setImageFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove))
        setImagePreviews((prevPreviews) => prevPreviews.filter((_, index) => index !== indexToRemove))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isViewMode) {
            onClose()
            return
        }

        // Validate rating - ensure it's a valid number
        if (!rating || rating === 0 || isNaN(rating)) {
            setSubmitError("Vui lòng chọn số sao đánh giá.")
            return
        }

        if (comment.trim() === "" && imageFiles.length === 0) {
            setSubmitError("Vui lòng nhập bình luận hoặc thêm ảnh.")
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        // Create payload with proper data types
        const payload = {
            rating: Number.parseInt(rating), // Ensure rating is an integer
            comment: comment.trim(),
            imageFiles: imageFiles,
        }

        try {
            await onSubmit(payload)
            // Clean up object URLs after submission
            imagePreviews.forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url)
                }
            })
            setImagePreviews([])
        } catch (error) {
            setSubmitError(error.message || "Đã xảy ra lỗi khi gửi đánh giá.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-content">
                <button className="review-modal-close-btn" onClick={onClose}>
                    &times;
                </button>
                <h2>{isViewMode ? "Xem đánh giá của bạn" : "Đánh giá sản phẩm"}</h2>

                <div className="review-product-info">
                    <p>
                        <strong>Sản phẩm:</strong> {item?.productName || item?.skuCode}
                    </p>
                    <p>
                        <strong>SKU:</strong> {item?.skuCode}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="review-form-group">
                        <label>Đánh giá của bạn:</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${star <= rating ? "selected" : ""} ${isViewMode ? "view-mode" : ""}`}
                                    onClick={() => handleStarClick(star)}
                                >
                  &#9733;
                </span>
                            ))}
                        </div>
                        <p className="rating-display">Đánh giá: {rating}/5 sao</p>
                    </div>

                    <div className="review-form-group">
                        <label htmlFor="comment">Bình luận:</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            maxLength="2000"
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                            readOnly={isViewMode}
                        ></textarea>
                    </div>

                    <div className="review-form-group">
                        <label htmlFor="imageUpload">Ảnh:</label>
                        {!isViewMode && (
                            <input
                                type="file"
                                id="imageUpload"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                disabled={imageFiles.length >= 5}
                            />
                        )}
                        <div className="review-images-preview">
                            {imagePreviews.map((url, index) => (
                                <div key={index} className="review-image-item">
                                    <img
                                        src={url || "/placeholder.svg"}
                                        alt={`Review ${index}`}
                                        className="review-image-thumbnail"
                                        onError={(e) => {
                                            console.error("Lỗi tải ảnh:", url)
                                            e.target.src = "/placeholder.svg?height=120&width=120"
                                        }}
                                        onLoad={() => {
                                            console.log("Ảnh tải thành công:", url)
                                        }}
                                    />
                                    {!isViewMode && (
                                        <button type="button" className="review-image-remove-btn" onClick={() => handleRemoveImage(index)}>
                                            &times;
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {submitError && <p className="review-submit-error">{submitError}</p>}

                    <div className="review-modal-actions">
                        <button type="button" onClick={onClose} className="review-modal-cancel-btn">
                            {isViewMode ? "Đóng" : "Hủy"}
                        </button>
                        {!isViewMode && (
                            <button type="submit" disabled={isSubmitting} className="review-modal-submit-btn">
                                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReviewModal
