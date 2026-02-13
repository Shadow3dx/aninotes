import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const passwordHash = await bcrypt.hash("AniNotes2024!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@aninotes.com" },
    update: {},
    create: {
      name: "AniNotes Admin",
      email: "admin@aninotes.com",
      username: "admin",
      passwordHash,
      bio: "Anime enthusiast and reviewer. Sharing my thoughts on every episode.",
    },
  });

  // Create tags
  const tagNames = [
    "Shonen",
    "Seinen",
    "Shojo",
    "Mecha",
    "Isekai",
    "Slice of Life",
    "Horror",
    "Sports",
  ];
  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    tags[name] = tag.id;
  }

  // Create categories
  const categoryNames = ["Currently Airing", "Completed", "Classic"];
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    categories[name] = cat.id;
  }

  // Create posts
  const posts = [
    {
      title: "Attack on Titan S4E28: A Masterpiece Conclusion",
      slug: "attack-on-titan-s4e28-a-masterpiece-conclusion",
      excerpt:
        "The final episode of Attack on Titan delivers an emotionally devastating and visually stunning conclusion to one of anime's greatest stories.",
      animeTitle: "Attack on Titan",
      episodeNumber: 28,
      season: "Season 4 Part 3",
      rating: 10,
      status: "PUBLISHED",
      publishedAt: new Date("2024-11-05"),
      contentMarkdown: `## The End of an Era

After over a decade, Attack on Titan has finally reached its conclusion, and what a conclusion it is. Episode 28 of the final season wraps up every major plotline with the emotional weight this series has always been known for.

## Animation Quality

MAPPA has outdone themselves. The Rumbling sequences are absolutely breathtaking, with fluid animation and incredible attention to detail. The final confrontation between Eren and the Alliance is choreographed perfectly.

## Emotional Impact

Without spoiling specifics, the final moments between Eren and Mikasa hit like a freight train. The voice acting is phenomenal — you can hear every ounce of pain, love, and resolution in their performances.

## The Controversial Ending

I know the manga ending divided fans, but the anime adaptation improves on it significantly. The additional scenes and expanded dialogue give the ending the breathing room it needed.

## Verdict

This is how you end a legendary series. Not perfect, but as close as we could have hoped for. Attack on Titan cements itself as one of the all-time greats.

> "If you win, you live. If you lose, you die. If you don't fight, you can't win."`,
      tagIds: [tags["Shonen"]],
      categoryIds: [categories["Completed"]],
    },
    {
      title: "Spy x Family S2E5: Anya Saves the Day Again",
      slug: "spy-x-family-s2e5-anya-saves-the-day-again",
      excerpt:
        "Another delightful episode where Anya's telepathy leads to hilarious misunderstandings and heartwarming family moments.",
      animeTitle: "Spy x Family",
      episodeNumber: 5,
      season: "Season 2",
      rating: 8,
      status: "PUBLISHED",
      publishedAt: new Date("2024-10-28"),
      contentMarkdown: `## Peak Comedy

Spy x Family continues to deliver the perfect blend of comedy, action, and heart. Episode 5 puts Anya front and center, and as always, she steals every scene she's in.

## The Mission

This episode follows Anya as she accidentally stumbles into one of Loid's missions at school. Her telepathy picks up on the danger before anyone else, leading to a chain of events that's both tense and hilarious.

## Family Dynamics

What makes this show special isn't the spy stuff — it's watching these three broken people slowly become a real family. The moment where Loid genuinely worries about Anya's safety (not just for the mission) is subtle but powerful.

## Animation Notes

CloverWorks maintains their consistent quality. The comedic expressions are exaggerated in all the right ways, and the action sequences, brief as they are, look clean.

## Final Thoughts

Not the most plot-heavy episode, but Spy x Family doesn't need to be. It's comfort anime at its finest, with just enough espionage to keep things spicy.`,
      tagIds: [tags["Shonen"], tags["Slice of Life"]],
      categoryIds: [categories["Currently Airing"]],
    },
    {
      title: "Neon Genesis Evangelion Ep 26: The Ending Debate",
      slug: "neon-genesis-evangelion-ep-26-the-ending-debate",
      excerpt:
        "Revisiting the most controversial anime ending of all time — is it genius or a budget-fueled mess? The answer might be both.",
      animeTitle: "Neon Genesis Evangelion",
      episodeNumber: 26,
      season: "Season 1",
      rating: 9,
      status: "PUBLISHED",
      publishedAt: new Date("2024-09-15"),
      contentMarkdown: `## The Elephant in the Room

Let's address it directly: yes, Evangelion's final two episodes are unlike anything else in anime. The budget was gone, Hideaki Anno was in a deep depression, and the result is... a psychological deconstruction told through still frames and congratulatory applause.

## What Actually Happens

Episodes 25 and 26 abandon the external conflict entirely. Instead, we dive deep into Shinji's psyche (and briefly, the other characters'). It's Instrumentality experienced from the inside — a therapy session in anime form.

## Why It Works

Anno strips away the mecha, the Angels, the conspiracies. What's left is the raw, uncomfortable truth about Shinji's self-hatred and his desperate need for connection. The "Congratulations" scene, memed as it is, represents genuine emotional breakthrough.

## Why People Hate It

I get it. You watch 24 episodes of escalating mecha battles and cosmic horror, and then the finale is a clip show about feelings. The tonal whiplash is severe, and if you're watching for plot resolution, you'll get nothing here.

## My Take

It's brilliant and frustrating in equal measure. Watch End of Evangelion for the "proper" ending, but these episodes are essential for understanding what Evangelion is actually about: not robots fighting aliens, but a broken kid learning it's okay to exist.

## Rating Justification

9/10 because it does something no other anime has ever dared to do. The point deduction is for being borderline inaccessible on first viewing.`,
      tagIds: [tags["Mecha"], tags["Seinen"]],
      categoryIds: [categories["Classic"]],
    },
    {
      title: "Vinland Saga S2E12: True Strength",
      slug: "vinland-saga-s2e12-true-strength",
      excerpt:
        "Thorfinn's journey from vengeful warrior to pacifist reaches its emotional peak in this incredible episode.",
      animeTitle: "Vinland Saga",
      episodeNumber: 12,
      season: "Season 2",
      rating: 9,
      status: "PUBLISHED",
      publishedAt: new Date("2024-08-20"),
      contentMarkdown: `## The Farmland Arc Delivers

Season 2 of Vinland Saga took a massive risk by slowing everything down. No more Viking battles. No more revenge quests. Just a slave on a farm, learning to be human again. And it works beautifully.

## Thorfinn's Transformation

Episode 12 is the culmination of Thorfinn's internal journey. When he declares "I have no enemies," it's not a battle cry — it's a revelation. After everything he's done and everything that's been done to him, he chooses peace.

## The Ketil Farm Tension

Meanwhile, the political tensions on the farm are reaching a boiling point. The contrast between Thorfinn's newfound pacifism and the violence brewing around him creates incredible dramatic tension.

## MAPPA's Direction

The directing in this episode is superb. Long, quiet shots of Thorfinn working the fields are intercut with flashbacks to his violent past. The visual storytelling says more than dialogue ever could.

## Why This Matters

In a medium full of power-ups and revenge arcs, Vinland Saga argues that the hardest thing a warrior can do is put down the sword. That's a radical message, and this episode delivers it perfectly.`,
      tagIds: [tags["Seinen"]],
      categoryIds: [categories["Completed"]],
    },
    {
      title: "Oshi no Ko S2E1: First Impressions",
      slug: "oshi-no-ko-s2e1-first-impressions",
      excerpt:
        "The highly anticipated second season opens strong with the beginning of the Tokyo Blade stage play arc.",
      animeTitle: "Oshi no Ko",
      episodeNumber: 1,
      season: "Season 2",
      rating: 7,
      status: "DRAFT",
      contentMarkdown: `## A Different Kind of Opening

Unlike Season 1's explosive premiere, Season 2 starts methodically. We're introduced to the Tokyo Blade stage play, and the entertainment industry commentary shifts from idol culture to theater.

## Aqua's Investigation

Aqua continues his quest to uncover the truth about his mother's death. The stage play is more than entertainment for him — it's a way to get closer to his father. The layers of deception are getting thicker.

## Ruby's Arc

Ruby gets more focus this season, and her determination to become an idol is taking on darker undertones. The parallel between her naivety and Ai's past is clearly intentional and ominous.

## Production Quality

Doga Kobo takes over from dynamic and it's... fine. The animation is competent but lacks the jaw-dropping moments that made Season 1's premiere legendary. The character acting is good, though.

## Concerns

My main worry is pacing. The manga's stage play arc is long, and this premiere suggests we're going to take our time. I hope they keep enough hooks to maintain momentum.

## Early Verdict

A solid but unspectacular start. The foundation is being laid for something potentially great, but this episode is more setup than payoff.`,
      tagIds: [tags["Seinen"]],
      categoryIds: [categories["Currently Airing"]],
    },
    {
      title: "Re:Zero S3E3: Return by Death's Toll",
      slug: "re-zero-s3e3-return-by-deaths-toll",
      excerpt:
        "Subaru faces his darkest loop yet as the consequences of Return by Death become increasingly unbearable.",
      animeTitle: "Re:Zero",
      episodeNumber: 3,
      season: "Season 3",
      rating: 8,
      status: "SCHEDULED",
      publishAt: new Date("2025-03-01"),
      contentMarkdown: `## The Weight of Infinite Deaths

Re:Zero has always been about suffering, but Season 3 Episode 3 takes it to another level. Subaru is trapped in a loop where every path leads to someone he loves dying, and the psychological toll is palpable.

## Voice Acting Masterclass

The voice actors deserve every award for this episode. Subaru's voice actor conveys the desperation of a man who has died hundreds of times with terrifying authenticity.

## World Building

We learn more about the mechanics of Return by Death and its connection to the Witch of Envy. The lore drops are carefully placed — enough to satisfy without overwhelming.

## The Isekai That Isn't

What sets Re:Zero apart from other isekai is that it treats being transported to another world as a curse, not a power fantasy. This episode drives that home harder than ever.

## Pacing

My only criticism is that the middle section drags slightly. One of the death loops feels redundant, and trimming it would have made the episode tighter.

## Looking Forward

The episode ends on a devastating cliffhanger. Whatever comes next, Subaru (and the viewer) won't be the same after this.`,
      tagIds: [tags["Isekai"]],
      categoryIds: [categories["Currently Airing"]],
    },
    {
      title: "Haikyuu!! Final Movie: The Dumpster Battle",
      slug: "haikyuu-final-movie-the-dumpster-battle",
      excerpt:
        "The long-awaited Karasuno vs Nekoma match finally gets the theatrical treatment it deserves.",
      animeTitle: "Haikyuu!!",
      episodeNumber: 1,
      season: "Movie",
      rating: 9,
      status: "PUBLISHED",
      publishedAt: new Date("2024-07-10"),
      contentMarkdown: `## The Battle of the Garbage Dump

Since the very first episode of Haikyuu!!, we've been waiting for Karasuno and Nekoma to face off at Nationals. The Dumpster Battle delivers on a decade of buildup.

## Animation Excellence

Production I.G has always excelled at sports animation, but this movie pushes it further. The rallies are kinetic and fluid, with creative camera angles that put you ON the court. The 3D-assisted sequences blend seamlessly.

## Character Payoff

Every character gets their moment. Kenma's transformation from disinterested gamer to passionate competitor is the emotional core, and his final rally with Hinata is one of the most cathartic moments in sports anime history.

## The Movie Format

Adapting this as a movie rather than a season was the right call. The match has an intensity that benefits from being experienced in one sitting. No week-long waits between sets — just pure, uninterrupted volleyball.

## Music and Sound Design

The soundtrack goes hard when it needs to and pulls back for quiet character moments. The sound design of the ball hits, sneaker squeaks, and crowd roars is immersive.

## Final Verdict

This is peak sports anime. Whether you've been following Haikyuu!! for years or you're a newcomer, The Dumpster Battle is an exhilarating, emotional, and visually stunning experience.

> The ball hasn't hit the floor yet.`,
      tagIds: [tags["Sports"], tags["Shonen"]],
      categoryIds: [categories["Completed"]],
    },
  ];

  for (const post of posts) {
    const { tagIds, categoryIds, ...postData } = post;
    const created = await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {},
      create: {
        ...postData,
        authorId: admin.id,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });
    console.log(`Created post: ${created.title}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
