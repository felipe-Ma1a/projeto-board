import { ChangeEvent, FormEvent, useState } from "react";

import { GetServerSideProps } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

import { db } from "@/services/firebaseConnection";
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
} from "firebase/firestore";

import { Textarea } from "@/components/textarea";
import { FaTrash } from "react-icons/fa";

import toast from "react-hot-toast";

import styles from "./styles.module.css";

interface TaskProps {
  item: {
    taskId: string;
    tarefa: string;
    public: boolean;
    user: string;
    created: string;
  };
  allComments: CommentProps[];
}

interface CommentProps {
  id: string;
  taskId: string;
  comment: string;
  user: string;
  name: string;
}

export default function Task({ item, allComments }: TaskProps) {
  const { data: session } = useSession();

  const [input, setInput] = useState("");
  const [comments, setComments] = useState<CommentProps[]>(allComments || []);

  async function handleComment(e: FormEvent) {
    e.preventDefault();

    if (input === "") return;

    if (!session?.user?.email || !session?.user?.name) return;

    const docRef = await addDoc(collection(db, "comments"), {
      taskId: item.taskId,
      comment: input,
      user: session.user.email,
      name: session.user.name,
      created: new Date(),
    });

    const data = {
      id: docRef.id,
      taskId: item?.taskId,
      comment: input,
      user: session?.user?.email,
      name: session?.user?.name,
    };

    setComments((oldItems) => [...oldItems, data]);
    setInput("");

    toast.success("Comentário adicionado a tarefa!");
  }

  async function handleDeleteComment(id: string) {
    const docRef = doc(db, "comments", id);
    await deleteDoc(docRef);
    const deleteComment = comments.filter((comment) => comment.id !== id);
    setComments(deleteComment);

    toast.success("Comentário excluido da tarefa!");
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Deixar comentário</h2>

        <form onSubmit={handleComment}>
          <Textarea
            placeholder="Digite o seu comentário..."
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
          />
          <button className={styles.button} disabled={!session?.user}>
            Enviar comentário
          </button>
        </form>
      </section>

      <section className={styles.commentsContainer}>
        <h2>Todos comentários</h2>
        {comments.length === 0 && (
          <span>Nenhum comentário foi encontrado...</span>
        )}

        {comments.map((item) => (
          <article className={styles.comment} key={item.id}>
            <div className={styles.headComment}>
              <label className={styles.commentsLabel}>{item.name}</label>
              {item.user === session?.user?.email && (
                <button
                  className={styles.buttonTrash}
                  onClick={() => handleDeleteComment(item.id)}
                >
                  <FaTrash size={18} color="#ea3140" />
                </button>
              )}
            </div>
            <p>{item.comment}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const q = query(collection(db, "comments"), where("taskId", "==", id));
  const snapshotComments = await getDocs(q);

  let allComments: CommentProps[] = [];
  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      taskId: doc.data().taskId,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
    });
  });

  const docRef = doc(db, "tarefas", id);
  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.created?.seconds * 1000;

  const task = {
    taskId: id,
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.public,
    user: snapshot.data()?.user,
    created: new Date(miliseconds).toLocaleDateString(),
  };

  return {
    props: {
      item: task,
      allComments: allComments,
    },
  };
};
