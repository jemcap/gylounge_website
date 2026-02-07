import { supabase } from "../lib/supabase";
import { Suspense } from "react";

const EventsPage = async () => {
  const { data: events, error } = await supabase.from("events").select("*");
  console.log("events", events);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        {events?.map((event) => (
          <div key={event.id}>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
          </div>
        ))}
      </div>
    </Suspense>
  );
};

export default EventsPage;
