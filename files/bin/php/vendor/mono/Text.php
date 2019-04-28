<?
namespace mono;
class Text 
{
    public static function randomId() {
        // Copyright: http://snippets.dzone.com/posts/show/3123
        $len = 8;
        $base='ABCDEFGHKLMNOPQRSTWXYZabcdefghjkmnpqrstwxyz';
        $max=strlen($base)-1;
        $activatecode='';
        mt_srand((double)microtime()*1000000);
        while (strlen($activatecode)<$len+1)
        $activatecode.=$base{mt_rand(0,$max)};
        return $activatecode;
    }

	public static function truncate($string, $max = 80) {
		return preg_replace('/\s+?(\S+)?$/', '', substr($string, 0, $max));
	}
	
    public static function contains($haystack,$needle){
			return strpos(strtolower($haystack), strtolower($needle)) !== false;
	}
	public static function fromCamelCase($camelCaseString){
			$re = '/(?<=[a-z])(?=[A-Z])/x';
			$a = preg_split($re, $camelCaseString);
			return join($a, " " );
	}	
	
    public static function leadingZero($number,$n) {
        return str_pad((int) $number,$n,"0",STR_PAD_LEFT);
    }
    
    public static function slug($str)
    {
        
        $str = self::normalizer($str);
        if (defined('mb_convert_encoding')) {
            if($str !== mb_convert_encoding( mb_convert_encoding($str, 'UTF-32', 'UTF-8'), 'UTF-8', 'UTF-32') )
                $str = mb_convert_encoding($str, 'UTF-8', mb_detect_encoding($str));
        }
        
        $str = htmlentities($str, ENT_NOQUOTES, 'UTF-8');
        $str = preg_replace('`&([a-z]{1,2})(acute|uml|circ|grave|ring|cedil|slash|tilde|caron|lig);`i', '\\1', $str);
        $str = html_entity_decode($str, ENT_NOQUOTES, 'UTF-8');
        $str = preg_replace(array('`[^a-z0-9]`i','`[-]+`'), '-', $str);
        $str = strtolower( trim($str, '-') );
        return $str;
    }
    
    public static function toUpper($string) 
	{ 
        return (strtoupper(strtr($string, 'ęóąśłżźćń','ĘÓĄŚŁŻŹĆŃ' ))); 
    } 

    public static function toLower($string) 
	{ 
        return (strtolower(strtr($string,'ĘÓĄŚŁŻŹĆŃ', 'ęóąśłżźćń' ))); 
    } 
  	
	public static function toUpperFirst($string) 
	{ 
        $string[0] = self::toUpper($string[0]);
        return (string)$string;
    } 

    public static function toLowerFirst($string) 
	{ 
		$string[0] = self::toLower($string[0]);
        return (string)($string);
    }
	
    public static function normalizer($string) 
    {

        $table =
            array(
                'À'=>'A','Á'=>'A','Â'=>'A','Ã'=>'A','Ä'=>'A','Å'=>'A','Æ'=>'A','Ç'=>'C','È'=>'E','É'=>'E','Ê'=>'E',
                'Ë'=>'E','Ì'=>'I','Í'=>'I','Î'=>'I','Ï'=>'I','Ð'=>'D','Ñ'=>'N','Ò'=>'O','Ó'=>'O','Ô'=>'E','Õ'=>'E',
                'Ö'=>'O','Ø'=>'O','Ù'=>'U','Ú'=>'U','Û'=>'U','Ü'=>'U','Ý'=>'Y','ß'=>'b','à'=>'a','á'=>'a','â'=>'a',
                'ã'=>'a','ä'=>'a','å'=>'a','æ'=>'a','ç'=>'c','è'=>'e','é'=>'e','ê'=>'e','ë'=>'e','ì'=>'i','í'=>'i',
                'î'=>'i','ï'=>'i','ñ'=>'n','ò'=>'o','ó'=>'o','ô'=>'o','õ'=>'o','ö'=>'o','ø'=>'o','ù'=>'u','ú'=>'u',
                'û'=>'u','ü'=>'u','ý'=>'y','ÿ'=>'y','Ā'=>'A','ā'=>'a','Ă'=>'A','ă'=>'a','Ą'=>'A','ą'=>'a','Ć'=>'c',
                'ć'=>'c','Ĉ'=>'c','ĉ'=>'c','Ċ'=>'c','ċ'=>'c','Č'=>'c','č'=>'c','Ď'=>'d','ď'=>'d','Đ'=>'d','đ'=>'d',
                'Ē'=>'E','ē'=>'e','Ĕ'=>'E','ĕ'=>'e','Ė'=>'E','ė'=>'e','Ę'=>'E','ę'=>'e','Ě'=>'E','ě'=>'e','Ĝ'=>'G',
                'ĝ'=>'G','Ğ'=>'G','ğ'=>'g','Ġ'=>'G','ġ'=>'g','Ģ'=>'G','ģ'=>'g','Ĥ'=>'A','ĥ'=>'h','Ħ'=>'H','ħ'=>'h',
                'Ĩ'=>'I','ĩ'=>'i','Ī'=>'I','ī'=>'i','Ĭ'=>'o','ĭ'=>'o','Į'=>'I','į'=>'i','İ'=>'I','ı'=>'z','Ĳ'=>'o',
                'ĳ'=>'o','Ĵ'=>'o','ĵ'=>'o','Ķ'=>'K','ķ'=>'k','Ĺ'=>'L','ĺ'=>'l','Ļ'=>'L','ļ'=>'l','Ľ'=>'l','ľ'=>'l',
                'Ŀ'=>'l','ŀ'=>'l','Ł'=>'L','ł'=>'l','Ń'=>'N','ń'=>'n','Ņ'=>'N','ņ'=>'n','Ň'=>'N','ň'=>'n','ŉ'=>'o',
                'Ō'=>'o','ō'=>'o','Ŏ'=>'o','ŏ'=>'o','Ő'=>'o','ő'=>'o','Œ'=>'AE','œ'=>'ae','Ŕ'=>'r','ŕ'=>'e','Ŗ'=>'R',
                'ŗ'=>'r','Ř'=>'R','ř'=>'r','Ś'=>'S','ś'=>'s','Ŝ'=>'S','ŝ'=>'s','Ş'=>'S','ş'=>'s','Š'=>'S','š'=>'s',
                'Ţ'=>'T','ţ'=>'t','Ť'=>'T','ť'=>'T','Ŧ'=>'T','ŧ'=>'t','Ũ'=>'U','ũ'=>'u','Ū'=>'U','ū'=>'u','Ŭ'=>'U',
                'ŭ'=>'u','Ů'=>'U','ů'=>'u','Ű'=>'U','ű'=>'u','Ų'=>'U','ų'=>'u','Ŵ'=>'W','ŵ'=>'w','Ŷ'=>'Y','ŷ'=>'y',
                'Ÿ'=>'Y','Ź'=>'Z','ź'=>'z','Ż'=>'Z','ż'=>'z','Ž'=>'z','ž'=>'z','ſ'=>'o','ƒ'=>'f','Ơ'=>'o','ơ'=>'o',
                'Ư'=>'o','ư'=>'o','Ǎ'=>'o','ǎ'=>'o','Ǐ'=>'o','ǐ'=>'o','Ǒ'=>'o','ǒ'=>'o','Ǔ'=>'o','ǔ'=>'o','Ǖ'=>'o',
                'ǖ'=>'o','Ǘ'=>'o','ǘ'=>'o','Ǚ'=>'o','ǚ'=>'o','Ǜ'=>'o','ǜ'=>'o','Ǻ'=>'o','ǻ'=>'o','Ǽ'=>'o','ǽ'=>'o',
                'Ǿ'=>'o','ǿ'=>'o','#'=>'hash','&'=>'i');

    
        return strtr($string, $table);
    }
   
    public static function urlFriendlyName($text){
        $text = self::normalizer($text);   
        $text = self::toLower($text); 
		
		$text = str_replace('\\', '-', $text);   
		$text = str_replace('/', '-', $text);   
		$text = str_replace('.', '-', $text);   
		$text = str_replace(',', '-', $text);   
		$text = str_replace('_', '-', $text); 
        $text = str_replace(' ', '-', $text);   
        $text = preg_replace('/[^0-9a-z\-]+/', '', $text);   
        $text = preg_replace('/[\-]+/', '-', $text);   
        $text = trim($text, '-');   
        return $text;
    }

    public static function toMoney($value)
    {
        $decimals = 2;
        $decimals_separator = ',';
        $thousands_separator = '';
        return number_format($value, $decimals, $decimals_separator, $thousands_separator);
    }
    
    public static function toFloat($value)
    {
        $value = str_replace(' ','',$value);
        $value = str_replace(',','.',$value);
        return $value;
    }

    public static function pre($value)
    {
        echo "<pre>",print_r($value,1)."</pre>";
    }
	
	
	public static function getFullUserName($user)
	{
		
		if($user->firstmname!='' or $user->lastname!='')
		{
			
		}
		else
		{
			
		}
	}
	
	public static function isMail($email)
	{
	   return filter_var($email, FILTER_VALIDATE_EMAIL);
	}
	
	public static function emptyToNull($str)
	{
		return empty($str)?'NULL':$str;
	}
	
	
	public static function debug($str)
	{
		global $debug;
		if($debug)
		{
			Text::pre($str);
		}
	}
	
	public static function ucName($string) 
	{
		$string = preg_replace('/\s+/', ' ',trim($string));
		$string = self::toLower($string);
		$words = explode(" ",$string);
		
		foreach($words as $key => $word)
		{
			$chars = preg_split('/(?!^)(?=.)/u', $word);
			$chars[0] = self::toUpper($chars[0]);
			$words[$key] = implode($chars);
		}
		$words = implode(" ",$words);

		$words = explode("-",$words);
		foreach($words as $key => $word)
		{
			$chars = preg_split('/(?!^)(?=.)/u', $word);
			$chars[0] = self::toUpper($chars[0]);
			$words[$key] = implode($chars);
		}
		
		$words = implode("-",$words);
		return  $words ;
	}
	
}
?>