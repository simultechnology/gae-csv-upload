package file.upload;

import gae.Dictionary;
import gae.PersManFact;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import javax.jdo.PersistenceManager;
import javax.servlet.ServletException;
import javax.servlet.http.*;


import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

@SuppressWarnings("serial")
public class FileUploadServlet extends HttpServlet {

	// インスタンス保持用
	// このためクローズ処理を書いていないのだが
	// いいのだろうか？
	private PersistenceManager pm;

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		ServletFileUpload fileUpload = new ServletFileUpload();
		try {
			FileItemIterator itemIterator = fileUpload.getItemIterator(req);
			while (itemIterator.hasNext()) {
				FileItemStream itemStream = itemIterator.next();
				InputStream inputStream = itemStream.openStream();
				String contentType = itemStream.getContentType();
				if (contentType == null) {
					contentType = "";
				}
				// 画像ファイルの時はそのまま書き出し処理
				if (contentType.contains("image")) {
					resp.setContentType(contentType);
					BufferedInputStream bi = new BufferedInputStream(
							inputStream);
					int len;
					while ((len = bi.read()) != -1) {
						resp.getOutputStream().write(len);
					}
					// テキストファイルの場合またはファイル名の拡張子が".csv"の場合
				} else if (contentType.contains("text")
						|| itemStream.getName().endsWith(".csv")) {
					resp.setContentType("text/html");
					BufferedReader buffer = new BufferedReader(
							new InputStreamReader(inputStream, "UTF-8"));
					String line = null;
					int i = 0;
					while ((line = buffer.readLine()) != null) {
						String[] split = line.split(",");

						if (split != null && split.length == 3) {
							// csvから単語の取り出し
							String word = split[0].trim();
							// csvから訳の取り出し
							String translation = split[1].trim();
							// csvから更新者の取り出し
							String person = split[2].trim();

							SimpleDateFormat formatter = new SimpleDateFormat(
									"yyyy/M/d H:mm:ss");
							formatter.setTimeZone(TimeZone.getTimeZone("JST"));
							// 更新者の日時
							String updateTime = formatter.format(new Date());
							// 登録するモデル
							Dictionary per = new Dictionary(word, translation,
									person, updateTime);
							if (pm == null) {
								pm = PersManFact.get().getPersistenceManager();
							}
							pm.makePersistent(per);
							i++;
						}
					}
					resp.setCharacterEncoding("UTF-8");
					resp.getWriter().write(i + "件登録しました。<br /><br />");
					resp.getWriter().write("<a href=\"/\">トップページへ戻る</a>");
				} else {
					resp.setContentType("text/html");
					resp.setCharacterEncoding("UTF-8");
					resp.getWriter().write("ファイルを認識できません。<br />");
					resp.getWriter().write("<a href=\"/\">トップページへ戻る</a>");
				}
			}
		} catch (FileUploadException e) {
			resp.sendError(500);
		}
	}
}
