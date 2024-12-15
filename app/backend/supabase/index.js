// import { createClient } from "@supabase/supabase-js";
// (SUPABASE_URL = process.env.SUPABASE_URL),
//   (SUPABASE_KEY = process.env.SUPABASE_KEY);
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// // такой способ доступа к переменным среды окружения является уникальным для `vite`

// export default supabase;

import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://gcjmgtakkprvqmqvbwif.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam1ndGFra3BydnFtcXZid2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3NzYzMzEsImV4cCI6MjA0ODM1MjMzMX0.Wh1hdwWKmRzHS7UC8rrVZYQpLd-VmqmZtkCWVN_m3bo";
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
