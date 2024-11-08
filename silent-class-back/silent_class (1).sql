PGDMP      /                |            silentclass    16.3    16.3 M               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    16645    silentclass    DATABASE     }   CREATE DATABASE silentclass WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Peru.1252';
    DROP DATABASE silentclass;
                postgres    false            �            1255    16646    check_tipo_usuario_docente()    FUNCTION       CREATE FUNCTION public.check_tipo_usuario_docente() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT TipoUsuario_id FROM usuario WHERE idUsuario = NEW.idDocente) != 2 THEN
        RAISE EXCEPTION 'El TipoUsuario debe ser Docente';
    END IF;
    RETURN NEW;
END;
$$;
 3   DROP FUNCTION public.check_tipo_usuario_docente();
       public          postgres    false            �            1255    16647    check_tipo_usuario_estudiante()    FUNCTION     (  CREATE FUNCTION public.check_tipo_usuario_estudiante() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT TipoUsuario_id FROM usuario WHERE idUsuario = NEW.idEstudiante) != 1 THEN
        RAISE EXCEPTION 'El TipoUsuario debe ser Estudiante';
    END IF;
    RETURN NEW;
END;
$$;
 6   DROP FUNCTION public.check_tipo_usuario_estudiante();
       public          postgres    false            �            1255    16648    es_docente(integer)    FUNCTION     �   CREATE FUNCTION public.es_docente(id_usuario integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM usuario WHERE idusuario = id_usuario AND tipousuario_id = 2);
END;
$$;
 5   DROP FUNCTION public.es_docente(id_usuario integer);
       public          postgres    false            �            1259    16649    cursos    TABLE     �   CREATE TABLE public.cursos (
    idcurso integer NOT NULL,
    idespecialidad integer,
    ncurso character varying(100) NOT NULL,
    descripcion text,
    iddocente integer,
    CONSTRAINT chk_iddocente_tipo CHECK (public.es_docente(iddocente))
);
    DROP TABLE public.cursos;
       public         heap    postgres    false    234            �            1259    16655    cursos_idcurso_seq    SEQUENCE     �   CREATE SEQUENCE public.cursos_idcurso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.cursos_idcurso_seq;
       public          postgres    false    215                       0    0    cursos_idcurso_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.cursos_idcurso_seq OWNED BY public.cursos.idcurso;
          public          postgres    false    216            �            1259    16656    docente    TABLE     �   CREATE TABLE public.docente (
    iddocente integer NOT NULL,
    idespecialidad integer NOT NULL,
    entidadeducativa character varying(255) NOT NULL,
    idusuario integer NOT NULL
);
    DROP TABLE public.docente;
       public         heap    postgres    false            �            1259    16659    especialidad    TABLE     |   CREATE TABLE public.especialidad (
    idespecialidad integer NOT NULL,
    especialidad character varying(255) NOT NULL
);
     DROP TABLE public.especialidad;
       public         heap    postgres    false            �            1259    16662    especialidad_idespecialidad_seq    SEQUENCE     �   CREATE SEQUENCE public.especialidad_idespecialidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public.especialidad_idespecialidad_seq;
       public          postgres    false    218                       0    0    especialidad_idespecialidad_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public.especialidad_idespecialidad_seq OWNED BY public.especialidad.idespecialidad;
          public          postgres    false    219            �            1259    16663 
   estudiante    TABLE     T  CREATE TABLE public.estudiante (
    idestudiante integer NOT NULL,
    idusuario integer NOT NULL,
    fecha date NOT NULL,
    idespecialidad1 integer NOT NULL,
    nota1 numeric(5,2) NOT NULL,
    idespecialidad2 integer NOT NULL,
    nota2 numeric(5,2) NOT NULL,
    idespecialidad3 integer NOT NULL,
    nota3 numeric(5,2) NOT NULL
);
    DROP TABLE public.estudiante;
       public         heap    postgres    false            �            1259    16666    estudiante_idestudiante_seq    SEQUENCE     �   CREATE SEQUENCE public.estudiante_idestudiante_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.estudiante_idestudiante_seq;
       public          postgres    false    220                       0    0    estudiante_idestudiante_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.estudiante_idestudiante_seq OWNED BY public.estudiante.idestudiante;
          public          postgres    false    221            �            1259    16667 
   evaluacion    TABLE     �   CREATE TABLE public.evaluacion (
    idevaluacion integer NOT NULL,
    idestudiante integer NOT NULL,
    idpregunta integer NOT NULL,
    nota numeric(5,2) NOT NULL
);
    DROP TABLE public.evaluacion;
       public         heap    postgres    false            �            1259    16670    evaluacion_idevaluacion_seq    SEQUENCE     �   CREATE SEQUENCE public.evaluacion_idevaluacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.evaluacion_idevaluacion_seq;
       public          postgres    false    222                       0    0    evaluacion_idevaluacion_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.evaluacion_idevaluacion_seq OWNED BY public.evaluacion.idevaluacion;
          public          postgres    false    223            �            1259    16671    nivel    TABLE     |   CREATE TABLE public.nivel (
    idnivel integer NOT NULL,
    nivel character varying(20) NOT NULL,
    descripcion text
);
    DROP TABLE public.nivel;
       public         heap    postgres    false            �            1259    16676    nivel_idnivel_seq    SEQUENCE     �   CREATE SEQUENCE public.nivel_idnivel_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.nivel_idnivel_seq;
       public          postgres    false    224                       0    0    nivel_idnivel_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.nivel_idnivel_seq OWNED BY public.nivel.idnivel;
          public          postgres    false    225            �            1259    16677 	   preguntas    TABLE     �  CREATE TABLE public.preguntas (
    idpregunta integer NOT NULL,
    idespecialidad integer NOT NULL,
    idnivel integer NOT NULL,
    pregunta text NOT NULL,
    opcion_a character varying(100) NOT NULL,
    opcion_b character varying(100) NOT NULL,
    opcion_c character varying(100) NOT NULL,
    opcion_d character varying(100) NOT NULL,
    respuesta_correcta character varying(1) NOT NULL
);
    DROP TABLE public.preguntas;
       public         heap    postgres    false            �            1259    16682    preguntas_idpregunta_seq    SEQUENCE     �   CREATE SEQUENCE public.preguntas_idpregunta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.preguntas_idpregunta_seq;
       public          postgres    false    226                       0    0    preguntas_idpregunta_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.preguntas_idpregunta_seq OWNED BY public.preguntas.idpregunta;
          public          postgres    false    227            �            1259    16683    tipousuario    TABLE     y   CREATE TABLE public.tipousuario (
    idtipousuario integer NOT NULL,
    tipousuario character varying(255) NOT NULL
);
    DROP TABLE public.tipousuario;
       public         heap    postgres    false            �            1259    16686    tipousuario_idtipousuario_seq    SEQUENCE     �   CREATE SEQUENCE public.tipousuario_idtipousuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.tipousuario_idtipousuario_seq;
       public          postgres    false    228                       0    0    tipousuario_idtipousuario_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.tipousuario_idtipousuario_seq OWNED BY public.tipousuario.idtipousuario;
          public          postgres    false    229            �            1259    16687    usuario    TABLE     s  CREATE TABLE public.usuario (
    idusuario integer NOT NULL,
    tipousuario_id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    apellido_paterno character varying(255) NOT NULL,
    apellido_materno character varying(255) NOT NULL,
    dni integer NOT NULL,
    correo character varying(255) NOT NULL,
    contrasena character varying(255) NOT NULL
);
    DROP TABLE public.usuario;
       public         heap    postgres    false            �            1259    16692    usuario_idusuario_seq    SEQUENCE     �   CREATE SEQUENCE public.usuario_idusuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.usuario_idusuario_seq;
       public          postgres    false    230                       0    0    usuario_idusuario_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.usuario_idusuario_seq OWNED BY public.usuario.idusuario;
          public          postgres    false    231            D           2604    16693    cursos idcurso    DEFAULT     p   ALTER TABLE ONLY public.cursos ALTER COLUMN idcurso SET DEFAULT nextval('public.cursos_idcurso_seq'::regclass);
 =   ALTER TABLE public.cursos ALTER COLUMN idcurso DROP DEFAULT;
       public          postgres    false    216    215            E           2604    16694    especialidad idespecialidad    DEFAULT     �   ALTER TABLE ONLY public.especialidad ALTER COLUMN idespecialidad SET DEFAULT nextval('public.especialidad_idespecialidad_seq'::regclass);
 J   ALTER TABLE public.especialidad ALTER COLUMN idespecialidad DROP DEFAULT;
       public          postgres    false    219    218            F           2604    16695    estudiante idestudiante    DEFAULT     �   ALTER TABLE ONLY public.estudiante ALTER COLUMN idestudiante SET DEFAULT nextval('public.estudiante_idestudiante_seq'::regclass);
 F   ALTER TABLE public.estudiante ALTER COLUMN idestudiante DROP DEFAULT;
       public          postgres    false    221    220            G           2604    16696    evaluacion idevaluacion    DEFAULT     �   ALTER TABLE ONLY public.evaluacion ALTER COLUMN idevaluacion SET DEFAULT nextval('public.evaluacion_idevaluacion_seq'::regclass);
 F   ALTER TABLE public.evaluacion ALTER COLUMN idevaluacion DROP DEFAULT;
       public          postgres    false    223    222            H           2604    16697    nivel idnivel    DEFAULT     n   ALTER TABLE ONLY public.nivel ALTER COLUMN idnivel SET DEFAULT nextval('public.nivel_idnivel_seq'::regclass);
 <   ALTER TABLE public.nivel ALTER COLUMN idnivel DROP DEFAULT;
       public          postgres    false    225    224            I           2604    16698    preguntas idpregunta    DEFAULT     |   ALTER TABLE ONLY public.preguntas ALTER COLUMN idpregunta SET DEFAULT nextval('public.preguntas_idpregunta_seq'::regclass);
 C   ALTER TABLE public.preguntas ALTER COLUMN idpregunta DROP DEFAULT;
       public          postgres    false    227    226            J           2604    16699    tipousuario idtipousuario    DEFAULT     �   ALTER TABLE ONLY public.tipousuario ALTER COLUMN idtipousuario SET DEFAULT nextval('public.tipousuario_idtipousuario_seq'::regclass);
 H   ALTER TABLE public.tipousuario ALTER COLUMN idtipousuario DROP DEFAULT;
       public          postgres    false    229    228            K           2604    16700    usuario idusuario    DEFAULT     v   ALTER TABLE ONLY public.usuario ALTER COLUMN idusuario SET DEFAULT nextval('public.usuario_idusuario_seq'::regclass);
 @   ALTER TABLE public.usuario ALTER COLUMN idusuario DROP DEFAULT;
       public          postgres    false    231    230            �          0    16649    cursos 
   TABLE DATA           Y   COPY public.cursos (idcurso, idespecialidad, ncurso, descripcion, iddocente) FROM stdin;
    public          postgres    false    215   2`       �          0    16656    docente 
   TABLE DATA           Y   COPY public.docente (iddocente, idespecialidad, entidadeducativa, idusuario) FROM stdin;
    public          postgres    false    217   �b       �          0    16659    especialidad 
   TABLE DATA           D   COPY public.especialidad (idespecialidad, especialidad) FROM stdin;
    public          postgres    false    218   �b       �          0    16663 
   estudiante 
   TABLE DATA           �   COPY public.estudiante (idestudiante, idusuario, fecha, idespecialidad1, nota1, idespecialidad2, nota2, idespecialidad3, nota3) FROM stdin;
    public          postgres    false    220   �b                  0    16667 
   evaluacion 
   TABLE DATA           R   COPY public.evaluacion (idevaluacion, idestudiante, idpregunta, nota) FROM stdin;
    public          postgres    false    222   c                 0    16671    nivel 
   TABLE DATA           <   COPY public.nivel (idnivel, nivel, descripcion) FROM stdin;
    public          postgres    false    224   �c                 0    16677 	   preguntas 
   TABLE DATA           �   COPY public.preguntas (idpregunta, idespecialidad, idnivel, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta) FROM stdin;
    public          postgres    false    226   d                 0    16683    tipousuario 
   TABLE DATA           A   COPY public.tipousuario (idtipousuario, tipousuario) FROM stdin;
    public          postgres    false    228   �i                 0    16687    usuario 
   TABLE DATA           �   COPY public.usuario (idusuario, tipousuario_id, nombre, apellido_paterno, apellido_materno, dni, correo, contrasena) FROM stdin;
    public          postgres    false    230   j                  0    0    cursos_idcurso_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.cursos_idcurso_seq', 19, true);
          public          postgres    false    216                       0    0    especialidad_idespecialidad_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.especialidad_idespecialidad_seq', 3, true);
          public          postgres    false    219                       0    0    estudiante_idestudiante_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.estudiante_idestudiante_seq', 16, true);
          public          postgres    false    221                       0    0    evaluacion_idevaluacion_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.evaluacion_idevaluacion_seq', 1, false);
          public          postgres    false    223                       0    0    nivel_idnivel_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.nivel_idnivel_seq', 6, true);
          public          postgres    false    225                       0    0    preguntas_idpregunta_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.preguntas_idpregunta_seq', 36, true);
          public          postgres    false    227                       0    0    tipousuario_idtipousuario_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.tipousuario_idtipousuario_seq', 2, true);
          public          postgres    false    229                       0    0    usuario_idusuario_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.usuario_idusuario_seq', 19, true);
          public          postgres    false    231            N           2606    16702    cursos cursos_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (idcurso);
 <   ALTER TABLE ONLY public.cursos DROP CONSTRAINT cursos_pkey;
       public            postgres    false    215            P           2606    16704    docente docente_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_pkey PRIMARY KEY (iddocente);
 >   ALTER TABLE ONLY public.docente DROP CONSTRAINT docente_pkey;
       public            postgres    false    217            R           2606    16706    especialidad especialidad_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.especialidad
    ADD CONSTRAINT especialidad_pkey PRIMARY KEY (idespecialidad);
 H   ALTER TABLE ONLY public.especialidad DROP CONSTRAINT especialidad_pkey;
       public            postgres    false    218            T           2606    16708    estudiante estudiante_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_pkey PRIMARY KEY (idestudiante);
 D   ALTER TABLE ONLY public.estudiante DROP CONSTRAINT estudiante_pkey;
       public            postgres    false    220            V           2606    16710    evaluacion evaluacion_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.evaluacion
    ADD CONSTRAINT evaluacion_pkey PRIMARY KEY (idevaluacion);
 D   ALTER TABLE ONLY public.evaluacion DROP CONSTRAINT evaluacion_pkey;
       public            postgres    false    222            X           2606    16712    nivel nivel_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.nivel
    ADD CONSTRAINT nivel_pkey PRIMARY KEY (idnivel);
 :   ALTER TABLE ONLY public.nivel DROP CONSTRAINT nivel_pkey;
       public            postgres    false    224            Z           2606    16714    preguntas preguntas_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_pkey PRIMARY KEY (idpregunta);
 B   ALTER TABLE ONLY public.preguntas DROP CONSTRAINT preguntas_pkey;
       public            postgres    false    226            \           2606    16716    tipousuario tipousuario_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY public.tipousuario
    ADD CONSTRAINT tipousuario_pkey PRIMARY KEY (idtipousuario);
 F   ALTER TABLE ONLY public.tipousuario DROP CONSTRAINT tipousuario_pkey;
       public            postgres    false    228            ^           2606    16718    usuario usuario_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (idusuario);
 >   ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_pkey;
       public            postgres    false    230            i           2620    16719 *   docente trigger_check_tipo_usuario_docente    TRIGGER     �   CREATE TRIGGER trigger_check_tipo_usuario_docente BEFORE INSERT ON public.docente FOR EACH ROW EXECUTE FUNCTION public.check_tipo_usuario_docente();
 C   DROP TRIGGER trigger_check_tipo_usuario_docente ON public.docente;
       public          postgres    false    217    232            _           2606    16720 !   cursos cursos_idespecialidad_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_idespecialidad_fkey FOREIGN KEY (idespecialidad) REFERENCES public.especialidad(idespecialidad);
 K   ALTER TABLE ONLY public.cursos DROP CONSTRAINT cursos_idespecialidad_fkey;
       public          postgres    false    218    4690    215            a           2606    16725 $   docente docente_especialidad_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_especialidad_id_fkey FOREIGN KEY (idespecialidad) REFERENCES public.especialidad(idespecialidad);
 N   ALTER TABLE ONLY public.docente DROP CONSTRAINT docente_especialidad_id_fkey;
       public          postgres    false    4690    217    218            b           2606    16730    docente docente_iddocente_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_iddocente_fkey FOREIGN KEY (iddocente) REFERENCES public.usuario(idusuario);
 H   ALTER TABLE ONLY public.docente DROP CONSTRAINT docente_iddocente_fkey;
       public          postgres    false    230    4702    217            c           2606    16735    docente docente_idusuario_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.docente
    ADD CONSTRAINT docente_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);
 H   ALTER TABLE ONLY public.docente DROP CONSTRAINT docente_idusuario_fkey;
       public          postgres    false    4702    217    230            e           2606    16740 '   evaluacion evaluacion_idestudiante_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.evaluacion
    ADD CONSTRAINT evaluacion_idestudiante_fkey FOREIGN KEY (idestudiante) REFERENCES public.usuario(idusuario);
 Q   ALTER TABLE ONLY public.evaluacion DROP CONSTRAINT evaluacion_idestudiante_fkey;
       public          postgres    false    222    4702    230            d           2606    16745     estudiante fk_estudiante_usuario    FK CONSTRAINT     �   ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT fk_estudiante_usuario FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);
 J   ALTER TABLE ONLY public.estudiante DROP CONSTRAINT fk_estudiante_usuario;
       public          postgres    false    230    220    4702            `           2606    16750    cursos fk_iddocente    FK CONSTRAINT     �   ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT fk_iddocente FOREIGN KEY (iddocente) REFERENCES public.usuario(idusuario) ON DELETE CASCADE;
 =   ALTER TABLE ONLY public.cursos DROP CONSTRAINT fk_iddocente;
       public          postgres    false    230    4702    215            f           2606    16755 '   preguntas preguntas_idespecialidad_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_idespecialidad_fkey FOREIGN KEY (idespecialidad) REFERENCES public.especialidad(idespecialidad);
 Q   ALTER TABLE ONLY public.preguntas DROP CONSTRAINT preguntas_idespecialidad_fkey;
       public          postgres    false    218    4690    226            g           2606    16760     preguntas preguntas_idnivel_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.preguntas
    ADD CONSTRAINT preguntas_idnivel_fkey FOREIGN KEY (idnivel) REFERENCES public.nivel(idnivel);
 J   ALTER TABLE ONLY public.preguntas DROP CONSTRAINT preguntas_idnivel_fkey;
       public          postgres    false    226    224    4696            h           2606    16765 #   usuario usuario_tipousuario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_tipousuario_id_fkey FOREIGN KEY (tipousuario_id) REFERENCES public.tipousuario(idtipousuario);
 M   ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_tipousuario_id_fkey;
       public          postgres    false    228    230    4700            �   Z  x���ˎ�@E��W���y$Y"@J�F�6��]����~�!ÒE��f��m� E�Su�t�ۮ��*�p���F�8�<D1�%3	*-��ZrPڲ�BM���Zȸ@�{j��aC��J;+��6d�M���A�?���=���j��B�� �� �zݰ�<*�we5~�7Y���5�b��5嬒6�9�`�Mk��%�r�:�ϵ�9Ks��\�30W��OU�{�����n�W��E�[i������0kC!�̓ڂ��D:�h�X�	�M̨��P��q1u��>�^�kξ�����H�u�5D��n�������(����p|spN��h�E'���9!��@�����0�=�_I!�=چ���'ѝ���x>O���	�L�n�dg�A�)v;e���!jYG����Uj���ň�
*p��..����U1Y�9���{��`���x�C������o���@��Fo�=�HC<$����
�g܅ ����k7.� |��i2��<��A���uCj�y��2P��Z����-	�St�?p}��\��;$E�'�8��%�|����Iq������L}.�nZ��Z��1�g_���QY����      �      x������ � �      �   6   x�3��M,I�=��$39��ˈ�9?�4�N�<�9�˘�#��$�(3�+F��� ��      �   p   x�}��� ��^��6�A/鿎p&�qQ��<�Wt4�Z�46v^�a�88 Ի��6]O��/Q���/<!��Ԕ|I��F]R�z�8K׹��v��S�����=��_8���Z�/�             x������ � �         e   x�3�(��M,�LT03S�ҋS�RR
�R\FUF����y@�ʌʌ9CR���f�Pe��\�XT��,S�*S����<����̀���(F��� �_M�         �  x��VMo�8=ӿ��٬-ˎ݋�f��h��q/#�vP�JIA����sȡ譗��7���,M-�3of޼�TL���ϳ��u�����|&gk���X������'���Ϭ����:�Z��P��%��f�+�9Ӊ�����86{t��Tj��du���d����M���'#GR�%��h�e�JuᕷT�ص�$sser��R�x�l6~$�T��jx�����kD3���F� o�+�����o���e��n���>sK ����A�GA�1L�,M�x�Zk���9�uL&��FS���0ed�uJD��t!ҥ��t&�AAa��:����,e��xK�����$��~lڻ�2�I��J����#��H������C���kv=���OJ��L���� ��U|��CWX��e��GQ����jX���49��)��!3/��6W^TMU�������
Vӝս5�a�*��֢� ���.M�>�͖���w��0��t�m�cpkRLUk�<�ZB����\ְ���Q��NL#g ��YP@�E�������[�C�$y����ƀ��Ұ�T�-[�Jj����4/
�g����g:-v�>ؕ�+m��t��Hǹi4�F��]f,_��Yd�K�T�g�8.\��&�`��kqZ�w��e|I��{��V��䉘E�ED�LW=	о��ԝ)Y� A(A�\��߃&�f5��Z*H(�<�A\��7�G�s;���l����.���;�ո\�NH�>��;�2O�3~K'��lۭ���(J�cђ%�겱� 
tX{O}��7^�Ò��1���A%C�x�ޗF�=~Nh�\ˎ�*�G��mJGU�*��n���좡k��2&:����	z0X����2Ǆ���\�tV�]{�4���=�(:��[�{u�E�gt�<y����Z�ܪɂ��sR��`?��Ħ�՗^)�E�VTmŒ����P�l�F5���4�����y��O�A�R{�p�<\�{ȁ�n�4<6��f96���@"q}OO��7̵g2�is�����*N��11��	���Ι�<���h7(Q�|6�,yw�<�Oh��l�� m8Є(c�.B�O��1�tZ�:�[ye�ٸ�E]wB�V���{E�Vjo�+d"��(�=W &�0_�s9���s�	�n��<������Z��%��HZNW~����U �-"�ɢ�!lE%F�����\k�8k*�{0���P�d9I�[s��΃7�ac����v�e�Z�^?6��s��ʚ53��9�t��u�4+��o��+L����������o���@6,7(������������q�(�@�� �Z|@(���V�rX)x;�	�d��s8�2�Ӌ��:e�\wJg;������Q�7���/����
�C:�&��'&(���h4����F         !   x�3�t-.)M�L�+I�2�t�ON�b���� �
         n  x����n�0���[T����N�"*E����b2���M����X		m׈��w����	24��`@#!o��ɪ�\{˪�I�A�GSmwj��U����_k@��iU��l��l�ku�	�e�� �c�<^��e��yҗ^����"��/��K�Џ%�"��Z�_�4��d�,;�8����0�̩=kH�K�(�L
B���3��c�4�SfS�f] �6�eT4Y�l�)�M�E�`1�g���;��5��M{�n�=�̬Z�U�e$B��nYG!�d]m�ꭲT��а��':`�����b_%4�/��LS�ZY��fK���<7�*9�a�L�xH�?�@�@!�BQY     