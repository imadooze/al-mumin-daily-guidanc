import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Volume2, Heart } from 'lucide-react';

interface Name {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  meaning: string;
  description: string;
}

interface NamesPageProps {
  onPageChange?: (page: string) => void;
}

export default function NamesPage({ onPageChange }: NamesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState<Name | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // أسماء الله الحسنى الـ99 كاملة
  const names: Name[] = [
    { id: 1, arabic: 'الله', transliteration: 'Allah', translation: 'Allah', meaning: 'الاسم الأعظم', description: 'الاسم الجامع لجميع صفات الكمال والجلال والجمال' },
    { id: 2, arabic: 'الرَّحْمٰن', transliteration: 'Ar-Rahman', translation: 'The Most Merciful', meaning: 'الرحيم بجميع خلقه', description: 'الذي وسعت رحمته كل شيء في الدنيا والآخرة' },
    { id: 3, arabic: 'الرَّحِيم', transliteration: 'Ar-Raheem', translation: 'The Most Compassionate', meaning: 'الرحيم بالمؤمنين خاصة', description: 'الذي يرحم عباده المؤمنين رحمة خاصة في الآخرة' },
    { id: 4, arabic: 'الْمَلِك', transliteration: 'Al-Malik', translation: 'The King', meaning: 'المالك لكل شيء', description: 'صاحب الملك المطلق الذي لا ينازعه فيه أحد' },
    { id: 5, arabic: 'الْقُدُّوس', transliteration: 'Al-Quddus', translation: 'The Most Holy', meaning: 'المنزه عن كل نقص', description: 'الطاهر المنزه عن جميع النقائص والعيوب' },
    { id: 6, arabic: 'السَّلَام', transliteration: 'As-Salaam', translation: 'The Source of Peace', meaning: 'مصدر السلام والأمان', description: 'الذي سلم من جميع العيوب والنقائص' },
    { id: 7, arabic: 'الْمُؤْمِن', transliteration: 'Al-Mu\'min', translation: 'The Guardian of Faith', meaning: 'المصدق لرسله', description: 'الذي يؤمن عباده من عذابه ويصدق رسله' },
    { id: 8, arabic: 'الْمُهَيْمِن', transliteration: 'Al-Muhaymin', translation: 'The Guardian', meaning: 'المهيمن على كل شيء', description: 'الرقيب الحافظ لكل شيء والشاهد على كل شيء' },
    { id: 9, arabic: 'الْعَزِيز', transliteration: 'Al-Azeez', translation: 'The Almighty', meaning: 'القوي الغالب', description: 'الذي لا يغلب ولا يقهر وهو الغالب لكل شيء' },
    { id: 10, arabic: 'الْجَبَّار', transliteration: 'Al-Jabbar', translation: 'The Compeller', meaning: 'القاهر العظيم', description: 'الذي يجبر الضعيف ويقهر الجبابرة بجبروته' },
    { id: 11, arabic: 'الْمُتَكَبِّر', transliteration: 'Al-Mutakabbir', translation: 'The Majestic', meaning: 'العظيم الكبير', description: 'المتعالي عن صفات الخلق المختص بصفات العظمة' },
    { id: 12, arabic: 'الْخَالِق', transliteration: 'Al-Khaliq', translation: 'The Creator', meaning: 'موجد كل شيء', description: 'الذي أوجد الأشياء من العدم وقدرها تقديراً' },
    { id: 13, arabic: 'الْبَارِئ', transliteration: 'Al-Bari', translation: 'The Originator', meaning: 'المبدع للخلق', description: 'الذي خلق الخلق بريئاً من التفاوت والاضطراب' },
    { id: 14, arabic: 'الْمُصَوِّر', transliteration: 'Al-Musawwir', translation: 'The Fashioner', meaning: 'مشكل كل مخلوق', description: 'الذي صور جميع الموجودات ورتبها فأعطى كل شيء صورته' },
    { id: 15, arabic: 'الْغَفَّار', transliteration: 'Al-Ghaffar', translation: 'The Repeatedly Forgiving', meaning: 'كثير المغفرة', description: 'الذي يغفر الذنوب مهما كثرت وعظمت لمن تاب واستغفر' },
    { id: 16, arabic: 'الْقَهَّار', transliteration: 'Al-Qahhar', translation: 'The Dominant', meaning: 'الغالب لكل شيء', description: 'الذي قهر كل شيء وخضع لعزته كل شيء' },
    { id: 17, arabic: 'الْوَهَّاب', transliteration: 'Al-Wahhab', translation: 'The Bestower', meaning: 'كثير العطاء', description: 'الذي يهب العطايا ويجزل المواهب بلا عوض' },
    { id: 18, arabic: 'الرَّزَّاق', transliteration: 'Ar-Razzaq', translation: 'The Provider', meaning: 'مقسم الأرزاق', description: 'الذي يرزق جميع الخلائق ويوصل إليهم أقواتهم' },
    { id: 19, arabic: 'الْفَتَّاح', transliteration: 'Al-Fattah', translation: 'The Opener', meaning: 'فاتح أبواب الرحمة', description: 'الذي يفتح أبواب الرزق والرحمة والهداية لعباده' },
    { id: 20, arabic: 'الْعَلِيم', transliteration: 'Al-Aleem', translation: 'The All-Knowing', meaning: 'العالم بكل شيء', description: 'الذي أحاط علمه بجميع الأشياء ظاهرها وباطنها' },
    { id: 21, arabic: 'الْقَابِض', transliteration: 'Al-Qabid', translation: 'The Restrainer', meaning: 'الذي يقبض الأرواح', description: 'الذي يضيق الرزق على من يشاء بحكمته ويقبض الأرواح' },
    { id: 22, arabic: 'الْبَاسِط', transliteration: 'Al-Basit', translation: 'The Extender', meaning: 'الذي يبسط الرزق', description: 'الذي يوسع الرزق لمن يشاء من عباده ويبسط يده بالعطاء' },
    { id: 23, arabic: 'الْخَافِض', transliteration: 'Al-Khafid', translation: 'The Abaser', meaning: 'الذي يخفض المتكبرين', description: 'الذي يذل أهل المعصية والطغيان ويخفض المتكبرين' },
    { id: 24, arabic: 'الرَّافِع', transliteration: 'Ar-Rafi', translation: 'The Exalter', meaning: 'الذي يرفع المؤمنين', description: 'الذي يرفع أولياءه بالطاعة ويعلي درجات عباده الصالحين' },
    { id: 25, arabic: 'الْمُعِزّ', transliteration: 'Al-Muizz', translation: 'The Honorner', meaning: 'معطي العزة', description: 'الذي يهب العز لمن يشاء من عباده ويقوي الضعفاء' },
    { id: 26, arabic: 'الْمُذِلّ', transliteration: 'Al-Mudhill', translation: 'The Humiliator', meaning: 'مذل الجبابرة', description: 'الذي يذل الطغاة والمتكبرين ويكسر شوكة الظالمين' },
    { id: 27, arabic: 'السَّمِيع', transliteration: 'As-Samee', translation: 'The All-Hearing', meaning: 'السامع لكل شيء', description: 'الذي يسمع جميع الأصوات خفيها وجليها سرها وعلانيتها' },
    { id: 28, arabic: 'الْبَصِير', transliteration: 'Al-Baseer', translation: 'The All-Seeing', meaning: 'المبصر لكل شيء', description: 'الذي يرى جميع الموجودات دقيقها وجليلها صغيرها وكبيرها' },
    { id: 29, arabic: 'الْحَكَم', transliteration: 'Al-Hakam', translation: 'The Judge', meaning: 'الحاكم العادل', description: 'الذي يقضي بين عباده بالعدل ولا يجور في حكمه' },
    { id: 30, arabic: 'الْعَدْل', transliteration: 'Al-Adl', translation: 'The Just', meaning: 'العادل في كل شيء', description: 'الذي لا يميل به الهوى فيجور في الحكم وهو منزه عن الظلم' },
    { id: 31, arabic: 'اللَّطِيف', transliteration: 'Al-Lateef', translation: 'The Gentle', meaning: 'الرفيق بعباده', description: 'الذي يدق علمه ويلطف عمله ويرفق بعباده في جميع أحوالهم' },
    { id: 32, arabic: 'الْخَبِير', transliteration: 'Al-Khabeer', translation: 'The Aware', meaning: 'العليم ببواطن الأمور', description: 'الذي انتهى علمه إلى الإحاطة ببواطن الأشياء وخفاياها' },
    { id: 33, arabic: 'الْحَلِيم', transliteration: 'Al-Haleem', translation: 'The Forbearing', meaning: 'الصبور على عباده', description: 'الذي لا يعجل بالعقوبة بل يمهل ويصبر ويعطي الفرصة للتوبة' },
    { id: 34, arabic: 'الْعَظِيم', transliteration: 'Al-Azeem', translation: 'The Magnificent', meaning: 'صاحب العظمة', description: 'الذي له العظمة في صفاته وأفعاله وذاته فلا يحيط به وصف' },
    { id: 35, arabic: 'الْغَفُور', transliteration: 'Al-Ghafoor', translation: 'The Forgiving', meaning: 'ساتر الذنوب', description: 'الذي يستر على عباده ويعفو عن سيئاتهم ولا يفضحهم' },
    { id: 36, arabic: 'الشَّكُور', transliteration: 'Ash-Shakoor', translation: 'The Appreciative', meaning: 'مثيب الطاعات', description: 'الذي يشكر عباده على طاعتهم ويضاعف لهم الأجر والثواب' },
    { id: 37, arabic: 'الْعَلِيّ', transliteration: 'Al-Ali', translation: 'The Exalted', meaning: 'الرفيع المقام', description: 'المتعالي عن جميع صفات النقص والمرتفع عن مشابهة خلقه' },
    { id: 38, arabic: 'الْكَبِير', transliteration: 'Al-Kabeer', translation: 'The Great', meaning: 'صاحب الكبرياء', description: 'العظيم الشأن الذي هو أكبر من كل شيء قدراً وشأناً ومنزلة' },
    { id: 39, arabic: 'الْحَفِيظ', transliteration: 'Al-Hafeedh', translation: 'The Guardian', meaning: 'الحافظ لكل شيء', description: 'الذي يحفظ عباده من المهالك ويحفظ عليهم أعمالهم وأقوالهم' },
    { id: 40, arabic: 'الْمُقِيت', transliteration: 'Al-Muqeet', translation: 'The Sustainer', meaning: 'معطي القوت', description: 'الذي يعطي كل مخلوق ما يحتاجه من القوت والطعام' },
    { id: 41, arabic: 'الْحَسِيب', transliteration: 'Al-Haseeb', translation: 'The Reckoner', meaning: 'المحاسب للعباد', description: 'الذي يحاسب العباد على أعمالهم ويجازيهم بما يستحقون' },
    { id: 42, arabic: 'الْجَلِيل', transliteration: 'Al-Jaleel', translation: 'The Majestic', meaning: 'صاحب الجلال', description: 'العظيم المتصف بجميع صفات الكمال والجلال والإكرام' },
    { id: 43, arabic: 'الْكَرِيم', transliteration: 'Al-Kareem', translation: 'The Generous', meaning: 'الجواد المعطاء', description: 'الذي لا ينقطع عطاؤه وإحسانه إلى عباده في جميع الأوقات' },
    { id: 44, arabic: 'الرَّقِيب', transliteration: 'Ar-Raqeeb', translation: 'The Watchful', meaning: 'المراقب لعباده', description: 'الذي يراقب أحوال عباده ولا يخفى عليه شيء من أمورهم' },
    { id: 45, arabic: 'الْمُجِيب', transliteration: 'Al-Mujeeb', translation: 'The Responsive', meaning: 'مجيب الدعوات', description: 'الذي يجيب دعوة الداعي إذا دعاه ولا يرد سائلاً' },
    { id: 46, arabic: 'الْوَاسِع', transliteration: 'Al-Wasi', translation: 'The All-Embracing', meaning: 'الواسع العطاء', description: 'الذي وسع كل شيء رحمة وعلماً وغنى وحكمة' },
    { id: 47, arabic: 'الْحَكِيم', transliteration: 'Al-Hakeem', translation: 'The Wise', meaning: 'صاحب الحكمة', description: 'الذي يضع الأشياء في مواضعها ولا يخلو فعل من أفعاله عن حكمة' },
    { id: 48, arabic: 'الْوَدُود', transliteration: 'Al-Wadood', translation: 'The Loving', meaning: 'المحب لعباده', description: 'الذي يحب عباده الصالحين ويودهم ويحبونه ويودونه' },
    { id: 49, arabic: 'الْمَجِيد', transliteration: 'Al-Majeed', translation: 'The Glorious', meaning: 'صاحب المجد', description: 'العظيم الشريف الذي له الكمال المطلق والشرف والعظمة' },
    { id: 50, arabic: 'الْبَاعِث', transliteration: 'Al-Ba\'ith', translation: 'The Resurrector', meaning: 'باعث الموتى', description: 'الذي يبعث الموتى يوم القيامة ويحيي الأرض بعد موتها' },
    { id: 51, arabic: 'الشَّهِيد', transliteration: 'Ash-Shaheed', translation: 'The Witness', meaning: 'الشاهد على كل شيء', description: 'الذي لا يغيب عن علمه شيء فهو شاهد على كل نجوى وعمل' },
    { id: 52, arabic: 'الْحَقّ', transliteration: 'Al-Haqq', translation: 'The Truth', meaning: 'الحق المبين', description: 'الثابت الذي لا يشك فيه والصادق في أقواله وأفعاله' },
    { id: 53, arabic: 'الْوَكِيل', transliteration: 'Al-Wakeel', translation: 'The Trustee', meaning: 'الكافي عباده', description: 'الذي توكل إليه الأمور فيتولاها ويكفي من وكله إليه' },
    { id: 54, arabic: 'الْقَوِيّ', transliteration: 'Al-Qawiyy', translation: 'The Strong', meaning: 'صاحب القوة', description: 'الذي له القوة البالغة والقدرة الكاملة فلا يعجزه شيء' },
    { id: 55, arabic: 'الْمَتِين', transliteration: 'Al-Mateen', translation: 'The Firm', meaning: 'شديد القوة', description: 'الذي اشتدت قوته فلا تحتاج إلى آلة أو معين في إمضاء حكمه' },
    { id: 56, arabic: 'الْوَلِيّ', transliteration: 'Al-Waliyy', translation: 'The Friend', meaning: 'ولي المؤمنين', description: 'الذي يتولى أمور عباده ويدبرها ويصلحها' },
    { id: 57, arabic: 'الْحَمِيد', transliteration: 'Al-Hameed', translation: 'The Praiseworthy', meaning: 'المستحق للحمد', description: 'المحمود الذي يستحق الحمد والثناء في جميع أفعاله وصفاته' },
    { id: 58, arabic: 'الْمُحْصِي', transliteration: 'Al-Muhsi', translation: 'The Counter', meaning: 'المحصي لكل شيء', description: 'الذي أحصى كل شيء عدداً فلا يفوته شيء ولا ينساه' },
    { id: 59, arabic: 'الْمُبْدِئ', transliteration: 'Al-Mubdi', translation: 'The Originator', meaning: 'بادئ الخلق', description: 'الذي بدأ خلق الأشياء واخترعها على غير مثال سابق' },
    { id: 60, arabic: 'الْمُعِيد', transliteration: 'Al-Mu\'eed', translation: 'The Restorer', meaning: 'معيد الخلق', description: 'الذي يعيد الخلق بعد الموت كما بدأهم أول مرة' },
    { id: 61, arabic: 'الْمُحْيِي', transliteration: 'Al-Muhyi', translation: 'The Giver of Life', meaning: 'واهب الحياة', description: 'الذي يحيي الموتى ويحيي الأرض بعد موتها' },
    { id: 62, arabic: 'الْمُمِيت', transliteration: 'Al-Mumeet', translation: 'The Taker of Life', meaning: 'مميت الأحياء', description: 'الذي يميت الأحياء ويقبض الأرواح في الوقت المحدد' },
    { id: 63, arabic: 'الْحَيّ', transliteration: 'Al-Hayy', translation: 'The Ever-Living', meaning: 'الحي الذي لا يموت', description: 'الذي له الحياة الكاملة التي لا بداية لها ولا نهاية' },
    { id: 64, arabic: 'الْقَيُّوم', transliteration: 'Al-Qayyoom', translation: 'The Self-Existing', meaning: 'القائم بذاته', description: 'الذي قام بنفسه وقام به كل شيء ولا يحتاج إلى غيره' },
    { id: 65, arabic: 'الْوَاجِد', transliteration: 'Al-Wajid', translation: 'The Finder', meaning: 'الواجد لكل شيء', description: 'الذي لا يعدمه شيء يريده ولا يفقد شيئاً يطلبه' },
    { id: 66, arabic: 'الْمَاجِد', transliteration: 'Al-Majid', translation: 'The Noble', meaning: 'صاحب الشرف', description: 'العظيم الذي له النبل والشرف والكرم الواسع' },
    { id: 67, arabic: 'الْوَاحِد', transliteration: 'Al-Wahid', translation: 'The One', meaning: 'الواحد الأحد', description: 'المنفرد في ذاته وصفاته وأفعاله لا شريك له' },
    { id: 68, arabic: 'الْأَحَد', transliteration: 'Al-Ahad', translation: 'The Unique', meaning: 'الأحد الفرد', description: 'الذي تفرد بالألوهية والربوبية وجميع صفات الكمال' },
    { id: 69, arabic: 'الصَّمَد', transliteration: 'As-Samad', translation: 'The Eternal', meaning: 'المقصود في الحوائج', description: 'الذي تصمد إليه الخلائق في حوائجها وهو الغني عن كل أحد' },
    { id: 70, arabic: 'الْقَادِر', transliteration: 'Al-Qadir', translation: 'The Capable', meaning: 'صاحب القدرة', description: 'الذي يقدر على كل شيء مما يشاء كيف يشاء' },
    { id: 71, arabic: 'الْمُقْتَدِر', transliteration: 'Al-Muqtadir', translation: 'The Powerful', meaning: 'البالغ في القدرة', description: 'الذي اشتدت قدرته فلا يمتنع عليه شيء أراده' },
    { id: 72, arabic: 'الْمُقَدِّم', transliteration: 'Al-Muqaddim', translation: 'The Expediter', meaning: 'مقدم الأشياء', description: 'الذي يقدم الأشياء ويضعها في مقدمة غيرها' },
    { id: 73, arabic: 'الْمُؤَخِّر', transliteration: 'Al-Mu\'akhkhir', translation: 'The Delayer', meaning: 'مؤخر الأشياء', description: 'الذي يؤخر الأشياء فيضعها في مواضعها المؤخرة' },
    { id: 74, arabic: 'الْأَوَّل', transliteration: 'Al-Awwal', translation: 'The First', meaning: 'الأول بلا بداية', description: 'الذي ليس قبله شيء فهو أول قبل كل أول' },
    { id: 75, arabic: 'الْآخِر', transliteration: 'Al-Akhir', translation: 'The Last', meaning: 'الآخر بلا نهاية', description: 'الذي ليس بعده شيء فهو الباقي بعد فناء كل شيء' },
    { id: 76, arabic: 'الظَّاهِر', transliteration: 'Az-Dhaahir', translation: 'The Manifest', meaning: 'الظاهر بالأدلة', description: 'الذي ظهر وجوده لكل عاقل بالأدلة الظاهرة' },
    { id: 77, arabic: 'الْبَاطِن', transliteration: 'Al-Baatin', translation: 'The Hidden', meaning: 'الباطن عن الإدراك', description: 'الذي احتجب عن إدراك الأبصار وعن وهم الأفكار' },
    { id: 78, arabic: 'الْوَالِي', transliteration: 'Al-Waali', translation: 'The Governor', meaning: 'الحاكم المدبر', description: 'المالك للأشياء المتصرف فيها بلا معارض ولا منازع' },
    { id: 79, arabic: 'الْمُتَعَالِي', transliteration: 'Al-Muta\'ali', translation: 'The Supreme', meaning: 'المتعالي عن كل شيء', description: 'الذي جل عن إفك المفترين وتعالى عن وصف الواصفين' },
    { id: 80, arabic: 'الْبَرّ', transliteration: 'Al-Barr', translation: 'The Benevolent', meaning: 'البر الرحيم', description: 'العطوف على عباده ببره وإحسانه ولطفه' },
    { id: 81, arabic: 'التَّوَّاب', transliteration: 'At-Tawwaab', translation: 'The Acceptor of Repentance', meaning: 'قابل التوبة', description: 'الذي يقبل توبة عباده مهما عظمت ذنوبهم' },
    { id: 82, arabic: 'الْمُنْتَقِم', transliteration: 'Al-Muntaqim', translation: 'The Avenger', meaning: 'المنتقم من العصاة', description: 'الذي ينتقم من أعدائه ولا يفوته ظالم' },
    { id: 83, arabic: 'الْعَفُوّ', transliteration: 'Al-Afuww', translation: 'The Pardoner', meaning: 'العفو الصفوح', description: 'الذي يعفو عن عباده ويصفح عن سيئاتهم' },
    { id: 84, arabic: 'الرَّؤُوف', transliteration: 'Ar-Ra\'oof', translation: 'The Compassionate', meaning: 'الرحيم الشفوق', description: 'الذي رحمته واسعة ورأفته عامة بجميع خلقه' },
    { id: 85, arabic: 'مَالِكُ الْمُلْك', transliteration: 'Malik-ul-Mulk', translation: 'Master of the Kingdom', meaning: 'مالك الملك', description: 'الذي له الملك وهو المالك للملك يؤتيه من يشاء' },
    { id: 86, arabic: 'ذُوالْجَلَالِ وَالْإِكْرَام', transliteration: 'Dhul-Jalali wal-Ikram', translation: 'Lord of Glory and Honor', meaning: 'صاحب الجلال والإكرام', description: 'المتصف بصفات الجلال والعظمة والكبرياء' },
    { id: 87, arabic: 'الْمُقْسِط', transliteration: 'Al-Muqsit', translation: 'The Equitable', meaning: 'العادل المنصف', description: 'الذي يقسط في أحكامه فلا يجور ولا يظلم أحداً' },
    { id: 88, arabic: 'الْجَامِع', transliteration: 'Al-Jami', translation: 'The Gatherer', meaning: 'جامع الخلق', description: 'الذي يجمع بين الأشياء المتماثلة والمختلفة' },
    { id: 89, arabic: 'الْغَنِيّ', transliteration: 'Al-Ghaniyy', translation: 'The Rich One', meaning: 'الغني المطلق', description: 'الذي لا يحتاج إلى أحد وكل أحد محتاج إليه' },
    { id: 90, arabic: 'الْمُغْنِي', transliteration: 'Al-Mughni', translation: 'The Enricher', meaning: 'مغني العباد', description: 'الذي يغني من يشاء من عباده عن الخلق' },
    { id: 91, arabic: 'الْمَانِع', transliteration: 'Al-Mani\'', translation: 'The Preventer', meaning: 'المانع لما يشاء', description: 'الذي يمنع ما يشاء عمن يشاء فلا مانع لما أعطى' },
    { id: 92, arabic: 'الضَّارّ', transliteration: 'Ad-Daarr', translation: 'The Distresser', meaning: 'خالق الضر', description: 'الذي بيده الضر والنفع فلا ضار إلا هو' },
    { id: 93, arabic: 'النَّافِع', transliteration: 'An-Nafi\'', translation: 'The Propitious', meaning: 'النافع العباد', description: 'الذي بيده النفع يعطيه لمن يشاء من عباده' },
    { id: 94, arabic: 'النُّور', transliteration: 'An-Noor', translation: 'The Light', meaning: 'نور السماوات والأرض', description: 'الذي نور السماوات والأرض ونور قلوب العارفين' },
    { id: 95, arabic: 'الْهَادِي', transliteration: 'Al-Haadi', translation: 'The Guide', meaning: 'هادي العباد', description: 'الذي يهدي من يشاء إلى الصراط المستقيم' },
    { id: 96, arabic: 'الْبَدِيع', transliteration: 'Al-Badee\'', translation: 'The Originator', meaning: 'مبدع كل شيء', description: 'الذي أبدع جميع الأشياء واخترعها لا على مثال سابق' },
    { id: 97, arabic: 'الْبَاقِي', transliteration: 'Al-Baaqi', translation: 'The Everlasting One', meaning: 'الباقي الدائم', description: 'الذي يبقى ويدوم بلا انتهاء ولا يلحقه فناء' },
    { id: 98, arabic: 'الْوَارِث', transliteration: 'Al-Waarith', translation: 'The Inheritor', meaning: 'وارث كل شيء', description: 'الذي يرث الأرض ومن عليها وهو الباقي بعد فناء خلقه' },
    { id: 99, arabic: 'الرَّشِيد', transliteration: 'Ar-Rasheed', translation: 'The Righteous Teacher', meaning: 'المرشد الحكيم', description: 'الذي أرشد الخلق إلى مصالحهم ودلهم على ما ينفعهم' }
  ];

  const filteredNames = names.filter(name =>
    name.arabic.includes(searchTerm) ||
    name.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.meaning.includes(searchTerm)
  );

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const playAudio = (arabic: string) => {
    // يمكن إضافة تشغيل الصوت هنا
    // const audio = new Audio(`/audio/names/${arabic}.mp3`);
    // audio.play();
    console.log(`Playing audio for: ${arabic}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground font-arabic-display">
          أسماء الله الحسنى
        </h1>
        <p className="text-muted-foreground">
          الأسماء التسعة والتسعون المبركة
        </p>
        <div className="text-lg font-arabic-display text-islamic-green">
          "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا"
        </div>
      </div>

      {/* شريط البحث */}
      <Card className="islamic-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في أسماء الله الحسنى..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-arabic"
            />
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-green">{names.length}</div>
            <p className="text-sm text-muted-foreground">إجمالي الأسماء</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-blue">{filteredNames.length}</div>
            <p className="text-sm text-muted-foreground">نتائج البحث</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-islamic-gold">{favorites.length}</div>
            <p className="text-sm text-muted-foreground">المفضلة</p>
          </CardContent>
        </Card>
        <Card className="islamic-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">99</div>
            <p className="text-sm text-muted-foreground">الأسماء الحسنى</p>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الأسماء */}
      <div className="grid gap-4">
        {filteredNames.map((name) => (
          <Card
            key={name.id}
            className={`islamic-card hover-lift cursor-pointer transition-all duration-300 ${
              selectedName?.id === name.id ? 'ring-2 ring-islamic-green shadow-islamic' : ''
            }`}
            onClick={() => setSelectedName(selectedName?.id === name.id ? null : name)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className="bg-islamic-green text-white min-w-[3rem] justify-center">
                    {name.id}
                  </Badge>
                  <div>
                    <CardTitle className="text-2xl font-arabic-display text-islamic-green">
                      {name.arabic}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {name.transliteration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(name.arabic);
                    }}
                    className="h-8 w-8"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(name.id);
                    }}
                    className="h-8 w-8"
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(name.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">المعنى:</span>
                  <span className="text-sm text-muted-foreground">{name.meaning}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">الترجمة:</span>
                  <span className="text-sm text-muted-foreground italic">{name.translation}</span>
                </div>
                
                {selectedName?.id === name.id && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg animate-fade-in">
                    <h4 className="font-bold text-islamic-green mb-2">الشرح والتفسير:</h4>
                    <p className="text-sm leading-relaxed font-arabic">
                      {name.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNames.length === 0 && (
        <Card className="islamic-card">
          <CardContent className="pt-6 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد نتائج للبحث "{searchTerm}"</p>
              <p className="text-sm mt-2">جرب البحث بكلمات مختلفة</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle className="text-center text-islamic-green">فضل معرفة أسماء الله الحسنى</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <div className="text-lg font-arabic-display leading-relaxed">
              "مَن أَحْصاها دَخَلَ الجَنَّةَ"
            </div>
            <p className="text-sm text-muted-foreground">
              صحيح البخاري ومسلم
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-bold text-islamic-green mb-2">معنى الإحصاء:</h4>
                <ul className="space-y-1 text-right text-xs">
                  <li>• الحفظ والفهم</li>
                  <li>• التدبر والتفكر</li>
                  <li>• الدعاء بها</li>
                  <li>• التعبد لله بمقتضاها</li>
                </ul>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-bold text-islamic-blue mb-2">آداب التعامل معها:</h4>
                <ul className="space-y-1 text-right text-xs">
                  <li>• التعظيم والإجلال</li>
                  <li>• عدم التحريف أو التشبيه</li>
                  <li>• الدعاء بها في الصلاة</li>
                  <li>• التخلق بآثارها</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}