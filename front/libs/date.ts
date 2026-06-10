import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * 日付をフォーマットする
 * @param date - UTC形式の日付文字列
 * @returns フォーマット済みの日付文字列 (例: "10 December, 2024")
 */
export const formatDate = (date: string): string => {
  if (!date) return ''; // `date`が存在しない場合は空文字を返す
  try {
    const utcDate = new Date(date);
    if (isNaN(utcDate.getTime())) throw new Error('Invalid date format'); // 無効な日付チェック
    const jstDate = toZonedTime(utcDate, 'Asia/Tokyo');
    return format(jstDate, 'd MMMM, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return ''; // エラー時は空文字を返す
  }
};
