איך להוסיף תמונות אמיתיות:

1) צור תיקייה בשם images בתוך המאגר (כאן היא כבר קיימת).
2) העלה לתיקייה images תמונות JPG/PNG בשמות באנגלית בלבד, ללא רווחים.
   דוגמה: angthong.jpg , kohphangan-1.jpg , tokyo-skytree.png

3) פתח את itinerary.json והוסף לכל מקום שדה image עם נתיב יחסי לתמונה:
   "image": "images/angthong.jpg"

דוגמה מלאה:
{
  "name": "Ang Thong",
  "type": "אטרקציה",
  "image": "images/angthong.jpg"
}

אם אין image, האפליקציה מציגה תמונת רקע גרפית אוטומטית.
